import { Request, Response, NextFunction } from "express";
import { supabase, getSupabaseForToken } from "../config/supabase.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  supabaseClient?: ReturnType<typeof getSupabaseForToken>;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No authorization header provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Add user info to request object and attach RLS-aware client
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.role,
    };
    req.supabaseClient = getSupabaseForToken(token);

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");

      if (token) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);

        if (user && !error) {
          req.user = {
            id: user.id,
            email: user.email!,
            role: user.role,
          };
          req.supabaseClient = getSupabaseForToken(token);
        }
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
