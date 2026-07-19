import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookingsTable, pitchesTable, membershipsTable } from "@workspace/db";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/** Read keys at request time so they're always fresh after a restart. */
function getKeys(): { secretKey: string; publicKey: string } | null {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;
  if (!secretKey || !publicKey) {
    logger.error(
      { secretKeySet: !!secretKey, publicKeySet: !!publicKey },
      "Paystack keys are not configured — set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in Replit Secrets and restart the server"
    );
    return null;
  }
  return { secretKey, publicKey };
}

const ADD_ON_PRICES: Record<string, number> = {
  referee: 5000,
  bibs: 2000,
  water: 3000,
};

const MEMBERSHIP_DISCOUNT = 0.1;

function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "SPP-";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

const BookingDataSchema = z.object({
  pitchId: z.number(),
  date: z.string(),
  timeSlot: z.string(),
  matchType: z.enum(["friendly", "competitive"]),
  addOns: z.array(z.enum(["referee", "bibs", "water"])),
  guestName: z.string().nullable().optional(),
  guestEmail: z.string().nullable().optional(),
});

async function calcPrice(pitchId: number, addOns: string[], userId: string | null) {
  const [pitch] = await db.select().from(pitchesTable).where(eq(pitchesTable.id, pitchId));
  if (!pitch) return null;

  const basePrice = Number(pitch.pricePerHour);
  const addOnsTotal = addOns.reduce((s, a) => s + (ADD_ON_PRICES[a] ?? 0), 0);

  let discountApplied = 0;
  if (userId) {
    const [mem] = await db.select().from(membershipsTable).where(eq(membershipsTable.userId, userId));
    if (mem) discountApplied = Math.round((basePrice + addOnsTotal) * MEMBERSHIP_DISCOUNT);
  }

  return { pitch, basePrice, addOnsTotal, discountApplied, totalPrice: basePrice + addOnsTotal - discountApplied };
}

const emptyPitch = (id: number) => ({
  id, name: "Unknown", location: "", format: "", surface: "", pricePerHour: 0, imageUrl: null, description: null, amenities: [],
});

// ─── POST /payments/initialize ────────────────────────────────────────────────
router.post("/payments/initialize", async (req, res): Promise<void> => {
  // Read keys fresh on every request so late-set secrets are always picked up
  const keys = getKeys();
  if (!keys) { res.status(500).json({ error: "Payment service is not configured. Contact support." }); return; }

  const parsed = BookingDataSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { pitchId, date, timeSlot, addOns, guestName, guestEmail } = parsed.data;

  // Slot must be free before charging
  const [slotTaken] = await db.select().from(bookingsTable).where(
    and(eq(bookingsTable.pitchId, pitchId), eq(bookingsTable.date, date), eq(bookingsTable.timeSlot, timeSlot))
  );
  if (slotTaken) { res.status(409).json({ error: "This time slot is already booked" }); return; }

  const userId = req.isAuthenticated() ? req.user.id : null;
  const email  = req.isAuthenticated() ? (req.user.email  ?? guestEmail) : guestEmail;
  const name   = req.isAuthenticated() ? (req.user.firstName ?? guestName) : guestName;

  if (!email) { res.status(400).json({ error: "An email address is required for payment" }); return; }

  const priceInfo = await calcPrice(pitchId, addOns as string[], userId);
  if (!priceInfo) { res.status(400).json({ error: "Pitch not found" }); return; }

  // Generate unique reference
  let reference = generateReference();
  for (let i = 0; i < 5; i++) {
    const [dup] = await db.select().from(bookingsTable).where(eq(bookingsTable.referenceNumber, reference));
    if (!dup) break;
    reference = generateReference();
  }

  // Initialize transaction with Paystack
  const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${keys.secretKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: priceInfo.totalPrice * 100, // kobo
      reference,
      currency: "NGN",
      metadata: {
        cancel_action: "https://turflink.ng",
        custom_fields: [
          { display_name: "Pitch",      variable_name: "pitch_name",  value: priceInfo.pitch.name },
          { display_name: "Match Date", variable_name: "match_date",  value: date },
          { display_name: "Time Slot",  variable_name: "time_slot",   value: timeSlot },
          { display_name: "Booker",     variable_name: "booker_name", value: name ?? "Guest" },
        ],
      },
    }),
  });

  const psData = (await psRes.json()) as { status: boolean };
  if (!psData.status) { res.status(502).json({ error: "Paystack could not initialize payment" }); return; }

  res.json({
    reference,
    amount: priceInfo.totalPrice * 100, // kobo — Paystack popup expects kobo
    publicKey: keys.publicKey,
    email,
    totalPrice: priceInfo.totalPrice,
    pitchName: priceInfo.pitch.name,
  });
});

// ─── POST /payments/verify ───────────────────────────────────────────────────
router.post("/payments/verify", async (req, res): Promise<void> => {
  // Read keys fresh on every request
  const keys = getKeys();
  if (!keys) { res.status(500).json({ error: "Payment service is not configured. Contact support." }); return; }

  const schema = z.object({ reference: z.string(), bookingData: BookingDataSchema });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { reference, bookingData } = parsed.data;

  // Idempotency: if booking already saved, just return it
  const [already] = await db.select().from(bookingsTable).where(eq(bookingsTable.referenceNumber, reference));
  if (already) {
    const [pitch] = await db.select().from(pitchesTable).where(eq(pitchesTable.id, already.pitchId));
    res.json({
      ...already,
      createdAt: already.createdAt instanceof Date ? already.createdAt.toISOString() : already.createdAt,
      pitch: pitch ?? emptyPitch(already.pitchId),
    });
    return;
  }

  // Verify with Paystack
  const verRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${keys.secretKey}` },
  });
  const verData = (await verRes.json()) as { status: boolean; data: { status: string; amount: number } };

  if (!verData.status || verData.data.status !== "success") {
    res.status(402).json({ error: "Payment was not completed. Please try again." });
    return;
  }

  // Re-calculate expected price server-side and compare (prevents amount tampering)
  const userId = req.isAuthenticated() ? req.user.id : null;
  const priceInfo = await calcPrice(bookingData.pitchId, bookingData.addOns as string[], userId);
  if (!priceInfo) { res.status(400).json({ error: "Pitch not found" }); return; }

  const expectedKobo = priceInfo.totalPrice * 100;
  if (verData.data.amount !== expectedKobo) {
    res.status(400).json({ error: "Payment amount does not match booking total" });
    return;
  }

  // Race-condition guard on the slot
  const [slotTaken] = await db.select().from(bookingsTable).where(
    and(
      eq(bookingsTable.pitchId, bookingData.pitchId),
      eq(bookingsTable.date, bookingData.date),
      eq(bookingsTable.timeSlot, bookingData.timeSlot),
    )
  );
  if (slotTaken) { res.status(409).json({ error: "This time slot was just booked by someone else" }); return; }

  // Save booking — payment is confirmed
  const userName  = req.isAuthenticated() ? (req.user.firstName ?? null) : (bookingData.guestName  ?? null);
  const userEmail = req.isAuthenticated() ? (req.user.email     ?? null) : (bookingData.guestEmail ?? null);

  const [booking] = await db.insert(bookingsTable).values({
    referenceNumber: reference,
    pitchId: bookingData.pitchId,
    userId,
    userName,
    userEmail,
    date: bookingData.date,
    timeSlot: bookingData.timeSlot,
    matchType: bookingData.matchType,
    addOns: bookingData.addOns as string[],
    basePrice: priceInfo.basePrice,
    addOnsTotal: priceInfo.addOnsTotal,
    discountApplied: priceInfo.discountApplied,
    totalPrice: priceInfo.totalPrice,
    status: "confirmed",
  }).returning();

  const [pitch] = await db.select().from(pitchesTable).where(eq(pitchesTable.id, bookingData.pitchId));

  res.status(201).json({
    ...booking!,
    createdAt: booking!.createdAt instanceof Date ? booking!.createdAt.toISOString() : booking!.createdAt,
    pitch: pitch ?? emptyPitch(bookingData.pitchId),
  });
});

export default router;
