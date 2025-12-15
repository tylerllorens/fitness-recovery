import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { computeReadiness } from "../services/score.js";

const upsertSchema = z.object({
  date: z.string(), // ISO date, e.g. "2025-11-11"
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  rhr: z.number().min(20).max(200).optional().nullable(), // Expanded max to 200
  hrv: z.number().min(0).max(300).optional().nullable(),
  strain: z.number().min(0).max(21).optional().nullable(),
  notes: z.string().optional().nullable(),
});

const dayQuerySchema = z.object({ date: z.string() });

export async function getMetricDays(userId) {
  return prisma.metricDay.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });
}

export async function upsertMetricDay(userId, payload) {
  const validatedPayload = upsertSchema.parse(payload);
  const {
    date: dateString,
    sleepHours,
    rhr,
    hrv,
    strain,
    notes,
  } = validatedPayload;

  const date = new Date(dateString);
  const readiness = await computeReadiness({ sleepHours, rhr, hrv, strain });

  return prisma.metricDay.upsert({
    where: { userId_date: { userId, date } },
    update: { date, sleepHours, rhr, hrv, strain, readiness, notes },
    create: { userId, date, sleepHours, rhr, hrv, strain, readiness, notes },
  });
}

export async function getLatestMetricDay(userId) {
  return prisma.metricDay.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function getMetricDayByDate(userId, dateString) {
  const { date } = dayQuerySchema.parse({ date: dateString });
  const day = new Date(date);
  return prisma.metricDay.findUnique({
    where: { userId_date: { userId, date: day } },
  });
}
