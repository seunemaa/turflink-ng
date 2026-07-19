import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, membershipsTable } from "@workspace/db";
import { GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  const [membership] = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, userId));

  res.json(
    GetMeResponse.parse({
      id: userId,
      name: req.user.firstName ?? null,
      email: req.user.email ?? null,
      profileImage: req.user.profileImageUrl ?? null,
      isMember: !!membership,
    })
  );
});

export default router;
