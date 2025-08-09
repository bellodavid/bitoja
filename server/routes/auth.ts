import { Router } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validation.js";

const router = Router();

// Get current user profile
router.get("/user", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get user profile from our users table
    const { data: userProfile, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        username,
        profile_image_url,
        phone_number,
        is_verified,
        created_at,
        wallets (
          asset_type,
          balance
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return res.status(404).json({ error: "User profile not found" });
    }

    // Transform wallets to a more convenient format
    const wallets = userProfile.wallets.reduce((acc: any, wallet: any) => {
      acc[wallet.asset_type.toLowerCase() + "Balance"] = wallet.balance;
      return acc;
    }, {});

    const user = {
      ...userProfile,
      ...wallets,
      wallets: undefined, // Remove the array format
    };

    res.json(user);
  } catch (error) {
    console.error("Error in /auth/user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put(
  "/user",
  authenticate,
  validate(schemas.userProfile),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return res.status(400).json({ error: "Failed to update profile" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in /auth/user PUT:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Sign up with email and password
router.post("/signup", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
      message:
        "User created successfully. Please check your email for verification.",
    });
  } catch (error) {
    console.error("Error in /auth/signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sign in with email and password
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.user.id);

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Error in /auth/signin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sign out
router.post(
  "/signout",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Error in /auth/signout:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /auth/refresh:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request password reset
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in /auth/reset-password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update password
router.post(
  "/update-password",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error in /auth/update-password:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
