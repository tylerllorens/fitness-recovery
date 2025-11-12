export function notFound(_req, res, _next) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
}
