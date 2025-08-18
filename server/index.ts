import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import advertisementRoutes from "./routes/advertisements.js";
import tradeRoutes from "./routes/trades.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-app-name.vercel.app", // Add your Vercel domain here
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/trades", tradeRoutes);

// Wallet routes
app.use("/api/wallets", (req, res, next) => {
  // Import wallet routes dynamically to avoid circular dependencies
  import("./routes/wallets.js")
    .then((module) => {
      module.default(req, res, next);
    })
    .catch(next);
});

// 404 handler for API routes only
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Catch-all handler for SPA routes (serve index.html for client-side routing)
app.get("*", (req, res) => {
  // In production, Vercel will handle static files
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  
  // In development, serve the index.html for SPA routing
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    // Multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        maxSize: process.env.MAX_FILE_SIZE || "5MB",
      });
    }

    if (error.message === "Invalid file type") {
      return res.status(400).json({
        error:
          "Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.",
      });
    }

    // Default error response
    res.status(error.status || 500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message || "Something went wrong",
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
  }
);

// Create uploads directory if it doesn't exist
import fs from "fs";
const uploadsDir = process.env.UPLOAD_PATH || "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Only start server in development mode
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 CORS origins: ${corsOptions.origin}`);
    console.log(`📁 Upload path: ${uploadsDir}`);
    console.log(
      `🔐 Rate limit: ${
        process.env.RATE_LIMIT_MAX_REQUESTS || 100
      } requests per ${
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000") / 60000
      } minutes`
    );
  });
}

export default app;
