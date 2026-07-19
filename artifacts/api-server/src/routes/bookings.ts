import { Router, type IRouter } from "express";
import { eq, desc, count, and } from "drizzle-orm";
import { db, bookingsTable, pitchesTable, membershipsTable } from "@workspace/db";
import {
  CreateBookingBody,
  GetBookingByReferenceParams,
  CreateBookingResponse,
  GetMyBookingsResponse,
  GetBookingByReferenceResponse,
  GetBookingsSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ADD_ON_PRICES: Record<string, number> = {
  referee: 5000,
  bibs: 2000,
  water: 3000,
};

const MEMBERSHIP_DISCOUNT = 0.10;

function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "SPP-";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

const emptyPitch = (pitchId: number) => ({
  id: pitchId,
  name: "Unknown",
  location: "",
  format: "",
  surface: "",
  pricePerHour: 0,
  imageUrl: null,
  description: null,
  amenities: [],
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { pitchId, date, timeSlot, matchType, addOns, guestName, guestEmail } = parsed.data;

  // Check pitch exists
  const [pitch] = await db.select().from(pitchesTable).where(eq(pitchesTable.id, pitchId));
  if (!pitch) {
    res.status(400).json({ error: "Pitch not found" });
    return;
  }

  // Check slot not already taken
  const [existing] = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.pitchId, pitchId),
        eq(bookingsTable.date, date),
        eq(bookingsTable.timeSlot, timeSlot),
      )
    );
  if (existing) {
    res.status(409).json({ error: "This time slot is already booked" });
    return;
  }

  // Calculate price
  const basePrice = Number(pitch.pricePerHour);
  const addOnsTotal = (addOns as string[]).reduce((sum, addon) => sum + (ADD_ON_PRICES[addon] ?? 0), 0);

  // Check membership for discount
  let discountApplied = 0;
  let userId: string | null = null;
  let userName: string | null = guestName ?? null;
  let userEmail: string | null = guestEmail ?? null;

  if (req.isAuthenticated()) {
    userId = req.user.id;
    userName = req.user.firstName ?? null;
    userEmail = req.user.email ?? null;

    const [membership] = await db
      .select()
      .from(membershipsTable)
      .where(eq(membershipsTable.userId, userId));
    if (membership) {
      discountApplied = Math.round((basePrice + addOnsTotal) * MEMBERSHIP_DISCOUNT);
    }
  }

  const totalPrice = basePrice + addOnsTotal - discountApplied;

  // Generate a unique reference
  let referenceNumber = generateReference();
  for (let i = 0; i < 5; i++) {
    const [dup] = await db.select().from(bookingsTable).where(eq(bookingsTable.referenceNumber, referenceNumber));
    if (!dup) break;
    referenceNumber = generateReference();
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      referenceNumber,
      pitchId,
      userId,
      userName,
      userEmail,
      date,
      timeSlot,
      matchType,
      addOns: addOns as string[],
      basePrice,
      addOnsTotal,
      discountApplied,
      totalPrice,
      status: "confirmed",
    })
    .returning();

  const b = booking!;
  res.status(201).json(
    CreateBookingResponse.parse({
      ...b,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      pitch,
    })
  );
});

router.get("/bookings/summary", async (_req, res): Promise<void> => {
  const [totalRow] = await db.select({ total: count() }).from(bookingsTable);
  const [confirmedRow] = await db
    .select({ total: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "confirmed"));

  // Most popular pitch
  const pitchCounts = await db
    .select({ pitchId: bookingsTable.pitchId, total: count() })
    .from(bookingsTable)
    .groupBy(bookingsTable.pitchId)
    .orderBy(desc(count()))
    .limit(1);

  let popularPitch: string | null = null;
  if (pitchCounts.length > 0) {
    const [topPitch] = await db
      .select({ name: pitchesTable.name })
      .from(pitchesTable)
      .where(eq(pitchesTable.id, pitchCounts[0]!.pitchId));
    popularPitch = topPitch?.name ?? null;
  }

  // Recent bookings with pitch data
  const recent = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(5);

  const allPitches = await db.select().from(pitchesTable);
  const pitchMap = new Map(allPitches.map((p) => [p.id, p]));

  const recentBookings = recent.map((b) => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    pitch: pitchMap.get(b.pitchId) ?? emptyPitch(b.pitchId),
  }));

  res.json(
    GetBookingsSummaryResponse.parse({
      totalBookings: totalRow?.total ?? 0,
      confirmedBookings: confirmedRow?.total ?? 0,
      popularPitch,
      recentBookings,
    })
  );
});

router.get("/bookings/my", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.userId, userId))
    .orderBy(desc(bookingsTable.createdAt));

  const allPitches = await db.select().from(pitchesTable);
  const pitchMap = new Map(allPitches.map((p) => [p.id, p]));

  const result = bookings.map((b) => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    pitch: pitchMap.get(b.pitchId) ?? emptyPitch(b.pitchId),
  }));

  res.json(GetMyBookingsResponse.parse(result));
});

router.get("/bookings/:reference", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
  const params = GetBookingByReferenceParams.safeParse({ reference: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.referenceNumber, params.data.reference));

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const [pitch] = await db
    .select()
    .from(pitchesTable)
    .where(eq(pitchesTable.id, booking.pitchId));

  res.json(
    GetBookingByReferenceResponse.parse({
      ...booking,
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
      pitch: pitch ?? emptyPitch(booking.pitchId),
    })
  );
});

export default router;
