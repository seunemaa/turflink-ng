import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pitchesTable } from "@workspace/db";
import {
  GetPitchParams,
  CheckAvailabilityParams,
  ListPitchesResponse,
  GetPitchResponse,
  CheckAvailabilityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pitches", async (_req, res): Promise<void> => {
  const pitches = await db.select().from(pitchesTable).orderBy(pitchesTable.id);
  res.json(ListPitchesResponse.parse(pitches));
});

router.get("/pitches/:id", async (req, res): Promise<void> => {
  const params = GetPitchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [pitch] = await db
    .select()
    .from(pitchesTable)
    .where(eq(pitchesTable.id, params.data.id));
  if (!pitch) {
    res.status(404).json({ error: "Pitch not found" });
    return;
  }
  res.json(GetPitchResponse.parse(pitch));
});

router.get("/pitches/:id/availability/:date", async (req, res): Promise<void> => {
  const params = CheckAvailabilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { id, date } = params.data;

  // All possible slots from 08:00 to 23:00
  const allSlots: string[] = [];
  for (let hour = 8; hour <= 23; hour++) {
    allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  // Get booked slots for this pitch on this date
  const { bookingsTable } = await import("@workspace/db");
  const { and } = await import("drizzle-orm");
  const bookings = await db
    .select({ timeSlot: bookingsTable.timeSlot })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.pitchId, id),
        eq(bookingsTable.date, date),
      )
    );

  const bookedSlots = bookings.map((b) => b.timeSlot);
  const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

  const response = CheckAvailabilityResponse.parse({
    pitchId: id,
    date,
    availableSlots,
    bookedSlots,
  });
  res.json(response);
});

export default router;
