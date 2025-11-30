import {
  getMetricDays,
  upsertMetricDay,
  getLatestMetricDay,
  getMetricDayByDate,
} from "./metricDay.service.js";

export async function getMetricDaysHandler(req, res, next) {
  try {
    const items = await getMetricDays(req.user.id);
    res.json({ items });
  } catch (e) {
    next(e);
  }
}

export async function upsertMetricDayHandler(req, res, next) {
  try {
    const item = await upsertMetricDay(req.user.id, req.body);
    res.status(201).json({ item });
  } catch (e) {
    next(e);
  }
}

export async function getMyLatestMetricDayHandler(req, res, next) {
  try {
    const item = await getLatestMetricDay(req.user.id);
    if (!item) {
      return res.status(404).json({ message: "No metric day found" });
    }
    res.json({ item });
  } catch (e) {
    next(e);
  }
}

export async function getMetricDayByDateHandler(req, res, next) {
  try {
    const { date } = req.query;
    const item = await getMetricDayByDate(req.user.id, date);
    if (!item) {
      return res.status(404).json({ error: "No metrics found for that date" });
    }
    res.json({ item });
  } catch (e) {
    next(e);
  }
}
