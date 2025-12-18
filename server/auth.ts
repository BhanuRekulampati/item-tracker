import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendOTPEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "qr-track-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      // Check if email is verified
      if (!user.emailVerified) {
        return done(new Error("Please verify your email before logging in"), false);
      }
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration attempt for username:', req.body.username);
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user (email not verified yet)
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        emailVerified: false,
      });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP
      await storage.createEmailVerification(user.id, user.email, otp, expiresAt);

      // Send OTP email
      await sendOTPEmail(user.email, otp, user.fullName);

      // Don't log in yet - user needs to verify email
      res.status(201).json({ 
        message: "Registration successful. Please check your email for verification code.",
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(500).json({ message });
    }
  });

  // Send OTP endpoint (for resending)
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createEmailVerification(user.id, user.email, otp, expiresAt);
      await sendOTPEmail(user.email, otp, user.fullName);

      res.json({ message: "Verification code sent to your email" });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // Verify OTP endpoint
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { userId, otp } = req.body;
      if (!userId || !otp) {
        return res.status(400).json({ message: "User ID and OTP are required" });
      }

      const verification = await storage.getEmailVerification(userId, otp);
      if (!verification) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      // Mark email as verified
      await storage.updateUser(userId, { emailVerified: true });
      
      // Delete the verification record
      await storage.deleteEmailVerification(userId, otp);

      // Get the updated user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json({ message: "Email verified successfully", user });
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}