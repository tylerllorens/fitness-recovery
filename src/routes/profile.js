import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../middleware/requireUser.js";

const router = Router();

// All routes in this router require authentication
router.use(requireUser);

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  dob: z.string().optional().nullable(), // Date of Birth in ISO format
  avatarUrl: z.string().url().optional().nullable(),
});

router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        dob: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/profile/me
router.patch("/me", async (req, res, next) => {
  try {
    const payload = profileUpdateSchema.parse(req.body);

    const updateData = { ...payload };

    // Convert dob from string → Date if provided
    if (typeof payload.dob === "string" && payload.dob.trim() !== "") {
      updateData.dob = new Date(payload.dob); // e.g. "1998-05-10"
    } else if (payload.dob === null) {
      // explicitly clear dob
      updateData.dob = null;
    } else {
      // if dob is undefined, don't touch it
      delete updateData.dob;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        dob: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
});

export default router;
