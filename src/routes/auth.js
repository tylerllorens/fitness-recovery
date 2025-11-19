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
    const token = req.cookies?.refresh;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked)
      return res.status(401).json({ error: "Token revoked" });
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: payload.id }, env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken });
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
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
