import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/requireUser.js";

const router = Router();
router.use(requireUser);

router.get("/7d", async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const data = await prisma.metricDay.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      orderBy: { date: "asc" },
      select: {
        date: true,
        sleepHours: true,
        rhr: true,
        hrv: true,
        strain: true,
        readiness: true,
      },
    });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get("/28d", async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 28);
    const data = await prisma.metricDay.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      orderBy: { date: "asc" },
      select: {
        date: true,
        sleepHours: true,
        rhr: true,
        hrv: true,
        strain: true,
        readiness: true,
      },
    });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

export default router;
