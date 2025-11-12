import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/requireUser.js";
import { computeReadiness } from "../services/score.js";

const router = Router();
router.use(requireUser);

const upsertSchema = z.object({
  date: z.string(), // ISO date, e.g. "2025-11-11"
  sleepHours: z.number().min(0).max(24),
  rhr: z.number().min(20).max(120),
  hrv: z.number().min(0).max(300),
  strain: z.number().min(0).max(21),
  notes: z.string().optional().nullable(),
});

router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.metricDay.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
      take: 30,
    });
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.post("/upsert", async (req, res, next) => {
  try {
    const payload = upsertSchema.parse(req.body);
    const date = new Date(payload.date);
    const readiness = await computeReadiness({
      sleepHours: payload.sleepHours,
      rhr: payload.rhr,
      hrv: payload.hrv,
      strain: payload.strain,
    });
    const item = await prisma.metricDay.upsert({
      where: { userId_date: { userId: req.user.id, date } },
      update: { ...payload, date, readiness },
      create: { userId: req.user.id, ...payload, date, readiness },
    });
    res.status(201).json({ item });
  } catch (e) {
    next(e);
  }
});

export default router;
