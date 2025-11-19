export function sendSuccess(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function sendCreated(res, data = null, message = "Created") {
  return sendSuccess(res, data, message, 201);
}

export function sendError(res, error, status = 400) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "Something went wrong";

  return res.status(status).json({
    success: false,
    message,
  });
}
