import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { sendSuccess, sendCreated, sendError } from "../utils/response.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    // Validate request body
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, "Email already in use", 409);
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    // Return user
    return sendCreated(
      res,
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      "User registered"
    );
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    // Validate body
    const { email, password } = loginSchema.parse(req.body);

    // Check credentials
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id },
    });

    // Set cookies
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Respond with tokens
    return sendSuccess(
      res,
      {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      },
      "Login successful"
    );
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies?.refresh;
    if (!token) {
      return sendError(res, "Missing refresh token", 401);
    }

    // Check if refresh token exists
    const stored = await prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.revoked) {
      return sendError(res, "Token revoked", 401);
    }

    // Verify JWT payload
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (e) {
      return sendError(res, "Invalid refresh token", 401);
    }

    if (!payload.id) {
      return sendError(res, "Refresh token payload missing id", 401);
    }

    // Create new access token
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return sendSuccess(res, { accessToken }, "Token refreshed");
  } catch (e) {
    next(e);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.refresh;
    if (token) {
      await prisma.refreshToken
        .update({ where: { token }, data: { revoked: true } })
        .catch(() => {});
      res.clearCookie("refresh");
    }
    return sendSuccess(res, null, "Logged out");
  } catch (e) {
    next(e);
  }
});

export default router;
