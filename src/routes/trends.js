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

router.get("/summary", async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7); // last 7 days

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

    if (data.length === 0) {
      return res.json({
        periodDays: 7,
        hasData: false,
        averages: null,
        bestDay: null,
        worstDay: null,
        recommendation:
          "No data in the last 7 days. Log some metrics to see insights.",
      });
    }

    const sum = data.reduce(
      (acc, d) => {
        acc.sleepHours += d.sleepHours;
        acc.rhr += d.rhr;
        acc.hrv += d.hrv;
        acc.strain += d.strain;
        acc.readiness += d.readiness;
        return acc;
      },
      { sleepHours: 0, rhr: 0, hrv: 0, strain: 0, readiness: 0 }
    );

    const n = data.length;
    const averages = {
      sleepHours: +(sum.sleepHours / n).toFixed(2),
      rhr: +(sum.rhr / n).toFixed(1),
      hrv: +(sum.hrv / n).toFixed(1),
      strain: +(sum.strain / n).toFixed(1),
      readiness: Math.round(sum.readiness / n),
    };

    // best / worst readiness day
    let best = data[0];
    let worst = data[0];
    for (const d of data) {
      if (d.readiness > best.readiness) best = d;
      if (d.readiness < worst.readiness) worst = d;
    }

    // very simple recommendation logic
    let recommendation = "Solid balance overall. Keep doing what you’re doing.";
    if (averages.sleepHours < 7) {
      recommendation =
        "Your average sleep is low. Prioritize 7–8 hours to improve readiness.";
    } else if (averages.strain > 12) {
      recommendation =
        "Training strain has been high. Consider a lighter day to recover.";
    } else if (averages.readiness < 60) {
      recommendation =
        "Readiness has been on the low side. Focus on sleep and lowering stress.";
    }

    res.json({
      periodDays: 7,
      hasData: true,
      averages,
      bestDay: {
        date: best.date,
        readiness: best.readiness,
      },
      worstDay: {
        date: worst.date,
        readiness: worst.readiness,
      },
      recommendation,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
