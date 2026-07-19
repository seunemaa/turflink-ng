import { Router, type IRouter } from "express";
import { gte, eq, sql, desc, and } from "drizzle-orm";
import { db, bookingsTable, pitchesTable } from "@workspace/db";

const router: IRouter = Router();

function isAdmin(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return ids.includes(userId);
}

router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Return user's own ID even if not admin yet — helps them self-configure
  const userId = req.user.id;
  if (!isAdmin(userId)) {
    res.status(403).json({ error: "Forbidden", yourUserId: userId });
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [revenueRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(total_price), 0)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "confirmed"));

  const [todayRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.date, today),
        eq(bookingsTable.status, "confirmed"),
      )
    );

  const upcoming = await db
    .select()
    .from(bookingsTable)
    .where(gte(bookingsTable.date, today))
    .orderBy(bookingsTable.date, bookingsTable.timeSlot)
    .limit(50);

  const allPitches = await db.select().from(pitchesTable);
  const pitchMap = new Map(allPitches.map((p) => [p.id, p]));

  const upcomingWithPitch = upcoming.map((b) => ({
    ...b,
    pitch: pitchMap.get(b.pitchId) ?? null,
  }));

  res.json({
    totalRevenue: Number(revenueRow?.total ?? 0),
    totalBookingsToday: Number(todayRow?.count ?? 0),
    upcomingMatches: upcomingWithPitch,
  });
});

export default router;
