import {
  users,
  items,
  emailVerifications,
  type User,
  type InsertUser,
  type Item,
  type InsertItem,
} from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  createEmailVerification(userId: number, email: string, otp: string, expiresAt: Date): Promise<void>;
  getEmailVerification(userId: number, otp: string): Promise<{ email: string; expiresAt: Date } | undefined>;
  deleteEmailVerification(userId: number, otp: string): Promise<void>;
  
  createItem(userId: number, item: InsertItem): Promise<Item>;
  getItemById(id: number): Promise<Item | undefined>;
  getItemByQrCodeId(qrCodeId: string): Promise<Item | undefined>;
  getItemsByUserId(userId: number): Promise<Item[]>;
  updateItem(id: number, item: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  incrementScanCount(id: number): Promise<Item | undefined>;
  
  sessionStore: session.Store;
}

const PostgresSessionStore = connectPg(session);

// Simple in-memory storage for local development/demo,
// avoids needing a live Postgres/Neon database.
class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private items: Item[] = [];
  private userIdSeq = 1;
  private itemIdSeq = 1;

  public sessionStore: session.Store;

  constructor() {
    // Use the default in-memory session store for Express.
    this.sessionStore = new session.MemoryStore();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdSeq++,
      emailVerified: false,
      ...insertUser,
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  private emailVerifications: Array<{
    id: number;
    userId: number;
    email: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
  }> = [];
  private emailVerificationIdSeq = 1;

  async createEmailVerification(userId: number, email: string, otp: string, expiresAt: Date): Promise<void> {
    // Delete any existing verifications for this user
    this.emailVerifications = this.emailVerifications.filter((ev) => ev.userId !== userId);
    
    this.emailVerifications.push({
      id: this.emailVerificationIdSeq++,
      userId,
      email,
      otp,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async getEmailVerification(userId: number, otp: string): Promise<{ email: string; expiresAt: Date } | undefined> {
    const verification = this.emailVerifications.find(
      (ev) => ev.userId === userId && ev.otp === otp && ev.expiresAt > new Date()
    );
    return verification ? { email: verification.email, expiresAt: verification.expiresAt } : undefined;
  }

  async deleteEmailVerification(userId: number, otp: string): Promise<void> {
    this.emailVerifications = this.emailVerifications.filter(
      (ev) => !(ev.userId === userId && ev.otp === otp)
    );
  }

  async createItem(userId: number, insertItem: InsertItem): Promise<Item> {
    const item: Item = {
      id: this.itemIdSeq++,
      userId,
      qrCodeId: nanoid(10),
      scanCount: 0,
      lastScan: null,
      createdAt: new Date(),
      isActive: true,
      name: insertItem.name,
      description: insertItem.description ?? null,
      icon: insertItem.icon ?? null,
    };
    this.items.push(item);
    return item;
  }

  async getItemById(id: number): Promise<Item | undefined> {
    return this.items.find((i) => i.id === id);
  }

  async getItemByQrCodeId(qrCodeId: string): Promise<Item | undefined> {
    return this.items.find((i) => i.qrCodeId === qrCodeId);
  }

  async getItemsByUserId(userId: number): Promise<Item[]> {
    return this.items.filter((i) => i.userId === userId);
  }

  async updateItem(id: number, updatedData: Partial<Item>): Promise<Item | undefined> {
    const item = await this.getItemById(id);
    if (!item) return undefined;

    Object.assign(item, updatedData);
    return item;
  }

  async deleteItem(id: number): Promise<boolean> {
    const before = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    return this.items.length < before;
  }

  async incrementScanCount(id: number): Promise<Item | undefined> {
    const item = await this.getItemById(id);
    if (!item) return undefined;

    item.scanCount = (item.scanCount || 0) + 1;
    item.lastScan = new Date();
    return item;
  }
}

class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      emailVerified: false,
    }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async createEmailVerification(userId: number, email: string, otp: string, expiresAt: Date): Promise<void> {
    // Delete any existing verifications for this user
    await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));
    
    await db.insert(emailVerifications).values({
      userId,
      email,
      otp,
      expiresAt,
    });
  }

  async getEmailVerification(userId: number, otp: string): Promise<{ email: string; expiresAt: Date } | undefined> {
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(and(eq(emailVerifications.userId, userId), eq(emailVerifications.otp, otp)));
    
    if (!verification || verification.expiresAt < new Date()) {
      return undefined;
    }
    
    return { email: verification.email, expiresAt: verification.expiresAt };
  }

  async deleteEmailVerification(userId: number, otp: string): Promise<void> {
    await db
      .delete(emailVerifications)
      .where(and(eq(emailVerifications.userId, userId), eq(emailVerifications.otp, otp)));
  }

  async createItem(userId: number, insertItem: InsertItem): Promise<Item> {
    const qrCodeId = nanoid(10);

    const [item] = await db
      .insert(items)
      .values({
        ...insertItem,
        userId,
        qrCodeId,
        scanCount: 0,
        lastScan: null,
        createdAt: new Date(),
        isActive: true,
      })
      .returning();

    return item;
  }

  async getItemById(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async getItemByQrCodeId(qrCodeId: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.qrCodeId, qrCodeId));
    return item;
  }

  async getItemsByUserId(userId: number): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.userId, userId));
  }

  async updateItem(id: number, updatedData: Partial<Item>): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set(updatedData)
      .where(eq(items.id, id))
      .returning();

    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    await db.delete(items).where(eq(items.id, id));
    return true;
  }

  async incrementScanCount(id: number): Promise<Item | undefined> {
    const item = await this.getItemById(id);
    if (!item) return undefined;

    const currentScanCount = item.scanCount || 0;

    const [updatedItem] = await db
      .update(items)
      .set({
        scanCount: currentScanCount + 1,
        lastScan: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    return updatedItem;
  }
}

// Use Supabase/Postgres by default; fall back to in-memory if explicitly requested.
const useInMemory = process.env.USE_IN_MEMORY_STORAGE === "true";

export const storage: IStorage = useInMemory
  ? new InMemoryStorage()
  : new DatabaseStorage();
