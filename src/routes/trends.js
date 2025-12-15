import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/requireUser.js";

function classifyReadinessZone(score) {
  if (score >= 80) return "green"; // high readiness
  if (score >= 60) return "yellow"; //medium
  return "red"; // low
}

const router = Router();
router.use(requireUser);

router.get("/7d", async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const rows = await prisma.metricDay.findMany({
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

    const data = rows.map((d) => ({
      ...d,
      zone: classifyReadinessZone(d.readiness),
    }));

    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get("/28d", async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 28);

    const rows = await prisma.metricDay.findMany({
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

    const data = rows.map((d) => ({
      ...d,
      zone: classifyReadinessZone(d.readiness),
    }));

    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const rawDays = Number(req.query.days);
    const periodDays = rawDays === 7 || rawDays === 28 ? rawDays : 7;
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

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
        periodDays,
        hasData: false,
        averages: null,
        bestDay: null,
        worstDay: null,
        zones: null,
        sleepStreak7hPlus: 0,
        greenStreak: 0,
        recommendation: `No data in the last ${periodDays} days. Log some metrics to see insights.`,
      });
    }

    // Calculate averages - only count days where metric exists
    const sums = data.reduce(
      (acc, d) => {
        if (d.sleepHours != null) {
          acc.sleepHours.total += d.sleepHours;
          acc.sleepHours.count += 1;
        }
        if (d.rhr != null) {
          acc.rhr.total += d.rhr;
          acc.rhr.count += 1;
        }
        if (d.hrv != null) {
          acc.hrv.total += d.hrv;
          acc.hrv.count += 1;
        }
        if (d.strain != null) {
          acc.strain.total += d.strain;
          acc.strain.count += 1;
        }
        acc.readiness.total += d.readiness;
        acc.readiness.count += 1;
        return acc;
      },
      {
        sleepHours: { total: 0, count: 0 },
        rhr: { total: 0, count: 0 },
        hrv: { total: 0, count: 0 },
        strain: { total: 0, count: 0 },
        readiness: { total: 0, count: 0 },
      }
    );

    const averages = {
      sleepHours:
        sums.sleepHours.count > 0
          ? +(sums.sleepHours.total / sums.sleepHours.count).toFixed(2)
          : null,
      rhr:
        sums.rhr.count > 0
          ? +(sums.rhr.total / sums.rhr.count).toFixed(1)
          : null,
      hrv:
        sums.hrv.count > 0
          ? +(sums.hrv.total / sums.hrv.count).toFixed(1)
          : null,
      strain:
        sums.strain.count > 0
          ? +(sums.strain.total / sums.strain.count).toFixed(1)
          : null,
      readiness:
        sums.readiness.count > 0
          ? Math.round(sums.readiness.total / sums.readiness.count)
          : 0,
    };

    // best / worst day
    let best = data[0];
    let worst = data[0];
    for (const d of data) {
      if (d.readiness > best.readiness) best = d;
      if (d.readiness < worst.readiness) worst = d;
    }

    // zones counts
    const zones = { green: 0, yellow: 0, red: 0 };
    for (const d of data) {
      const zone = classifyReadinessZone(d.readiness);
      zones[zone] += 1;
    }

    // full history streaks calculation (limited to last year for performance)
    const streakRows = await prisma.metricDay.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
      take: 365, // Only check last 365 days
      select: { date: true, sleepHours: true, readiness: true },
    });

    let sleepStreak7hPlus = 0;
    for (const d of streakRows) {
      if (d.sleepHours >= 7) {
        sleepStreak7hPlus += 1;
      } else {
        break;
      }
    }

    let greenStreak = 0;
    for (const d of streakRows) {
      if (d.readiness >= 80) {
        greenStreak += 1;
      } else {
        break;
      }
    }

    // simple recommendation logic
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

    return res.json({
      periodDays,
      hasData: true,
      averages,
      bestDay: {
        date: best.date,
        readiness: best.readiness,
        zone: classifyReadinessZone(best.readiness),
      },
      worstDay: {
        date: worst.date,
        readiness: worst.readiness,
        zone: classifyReadinessZone(worst.readiness),
      },
      zones,
      sleepStreak7hPlus,
      greenStreak,
      recommendation,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
