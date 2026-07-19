import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membershipsTable } from "@workspace/db";
import {
  SignUpMembershipBody,
  GetMembershipResponse,
  SignUpMembershipResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DISCOUNT_PERCENT = 10;

router.get("/membership", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const [membership] = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, userId));

  if (!membership) {
    res.json(GetMembershipResponse.parse({ isMember: false, memberSince: null, discountPercent: DISCOUNT_PERCENT }));
    return;
  }

  res.json(GetMembershipResponse.parse({
    isMember: true,
    memberSince: membership.memberSince.toISOString(),
    discountPercent: DISCOUNT_PERCENT,
  }));
});

router.post("/membership", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = SignUpMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user.id;

  // Check if already a member
  const [existing] = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, userId));
  if (existing) {
    res.status(409).json({ error: "Already a member" });
    return;
  }

  const [membership] = await db
    .insert(membershipsTable)
    .values({
      userId,
      email: parsed.data.email,
      name: parsed.data.name,
    })
    .returning();

  res.status(201).json(SignUpMembershipResponse.parse({
    isMember: true,
    memberSince: membership!.memberSince.toISOString(),
    discountPercent: DISCOUNT_PERCENT,
  }));
});

export default router;
