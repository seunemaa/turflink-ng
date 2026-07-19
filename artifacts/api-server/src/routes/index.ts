import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import authMeRouter from "./authme";
import pitchesRouter from "./pitches";
import bookingsRouter from "./bookings";
import membershipRouter from "./membership";
import weatherRouter from "./weather";
import adminRouter from "./admin";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(authMeRouter);
router.use(pitchesRouter);
router.use(bookingsRouter);
router.use(membershipRouter);
router.use(weatherRouter);
router.use(adminRouter);
router.use(paymentsRouter);

export default router;
