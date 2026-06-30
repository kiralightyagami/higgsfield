import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export type AuthRequest = Request & {
    userId?: string;
};

export function signToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ message: "invalid or expired token " });
    }
}
