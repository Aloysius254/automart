import { and, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Car,
  InsertCar,
  InsertCartItem,
  InsertOrder,
  InsertOrderItem,
  InsertSparePart,
  InsertUser,
  Order,
  SparePart,
  cartItems,
  carts,
  cars,
  orderItems,
  orders,
  productImages,
  spareParts,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Cars ─────────────────────────────────────────────────────────────────────
export interface CarFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function getCars(filters: CarFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.make) conditions.push(like(cars.make, `%${filters.make}%`));
  if (filters.model) conditions.push(like(cars.model, `%${filters.model}%`));
  if (filters.yearMin) conditions.push(gte(cars.year, filters.yearMin));
  if (filters.yearMax) conditions.push(lte(cars.year, filters.yearMax));
  if (filters.priceMin) conditions.push(gte(cars.price, String(filters.priceMin)));
  if (filters.priceMax) conditions.push(lte(cars.price, String(filters.priceMax)));
  if (filters.condition) conditions.push(sql`${cars.condition} = ${filters.condition}`);
  if (filters.bodyType) conditions.push(sql`${cars.bodyType} = ${filters.bodyType}`);
  if (filters.transmission) conditions.push(sql`${cars.transmission} = ${filters.transmission}`);
  if (filters.fuelType) conditions.push(sql`${cars.fuelType} = ${filters.fuelType}`);
  if (filters.status) conditions.push(eq(cars.status, filters.status as Car["status"]));
  else conditions.push(eq(cars.status, "available"));
  if (filters.featured !== undefined) conditions.push(eq(cars.featured, filters.featured));
  if (filters.search) {
    conditions.push(
      or(
        like(cars.make, `%${filters.search}%`),
        like(cars.model, `%${filters.search}%`),
        like(cars.description, `%${filters.search}%`)
      )!
    );
  }

  const query = db
    .select()
    .from(cars)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cars.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  return query;
}

export async function getCarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  return result[0];
}

export async function createCar(data: InsertCar) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(cars).values(data);
  return result;
}

export async function updateCar(id: number, data: Partial<InsertCar>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(cars).set(data).where(eq(cars.id, id));
}

export async function deleteCar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(cars).where(eq(cars.id, id));
}

export async function getDistinctCarMakes() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .selectDistinct({ make: cars.make })
    .from(cars)
    .where(eq(cars.status, "available"))
    .orderBy(cars.make);
  return result.map((r) => r.make);
}

// ─── Spare Parts ──────────────────────────────────────────────────────────────
export interface PartFilters {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  compatibleMake?: string;
  compatibleModel?: string;
  search?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export async function getSpareParts(filters: PartFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.active !== false) conditions.push(eq(spareParts.active, true));
  if (filters.category) conditions.push(sql`${spareParts.category} = ${filters.category}`);
  if (filters.brand) conditions.push(like(spareParts.brand, `%${filters.brand}%`));
  if (filters.priceMin) conditions.push(gte(spareParts.price, String(filters.priceMin)));
  if (filters.priceMax) conditions.push(lte(spareParts.price, String(filters.priceMax)));
  if (filters.featured !== undefined) conditions.push(eq(spareParts.featured, filters.featured));
  if (filters.compatibleMake) conditions.push(like(spareParts.compatibleMakes, `%${filters.compatibleMake}%`));
  if (filters.compatibleModel) conditions.push(like(spareParts.compatibleModels, `%${filters.compatibleModel}%`));
  if (filters.search) {
    conditions.push(
      or(
        like(spareParts.name, `%${filters.search}%`),
        like(spareParts.brand, `%${filters.search}%`),
        like(spareParts.description, `%${filters.search}%`),
        like(spareParts.sku, `%${filters.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(spareParts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(spareParts.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function getSparePartById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(spareParts).where(eq(spareParts.id, id)).limit(1);
  return result[0];
}

export async function createSparePart(data: InsertSparePart) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(spareParts).values(data);
}

export async function updateSparePart(id: number, data: Partial<InsertSparePart>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(spareParts).set(data).where(eq(spareParts.id, id));
}

export async function deleteSparePart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(spareParts).where(eq(spareParts.id, id));
}

// ─── Product Images ───────────────────────────────────────────────────────────
export async function getImagesByCarId(carId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.carId, carId))
    .orderBy(productImages.sortOrder);
}

export async function getImagesByPartId(partId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.partId, partId))
    .orderBy(productImages.sortOrder);
}

export async function addProductImage(data: {
  carId?: number;
  partId?: number;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(productImages).values(data);
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(productImages).where(eq(productImages.id, id));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export async function getOrCreateCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  await db.insert(carts).values({ userId });
  const created = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  return created[0]!;
}

export async function getCartItems(cartId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function addCartItem(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // Check if same item already in cart
  const conditions = [eq(cartItems.cartId, data.cartId)];
  if (data.partId) conditions.push(eq(cartItems.partId, data.partId));
  if (data.carId) conditions.push(eq(cartItems.carId, data.carId));

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(...conditions))
    .limit(1);

  if (existing[0]) {
    const newQty = existing[0].quantity + (data.quantity ?? 1);
    return db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing[0].id));
  }

  return db.insert(cartItems).values(data);
}

export async function updateCartItemQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (quantity <= 0) return db.delete(cartItems).where(eq(cartItems.id, id));
  return db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeCartItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(cartId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(orderData: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  await db.insert(orders).values(orderData);
  const created = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderData.orderNumber))
    .limit(1);
  const order = created[0]!;

  const itemsWithOrderId = items.map((item) => ({ ...item, orderId: order.id }));
  await db.insert(orderItems).values(itemsWithOrderId);

  return order;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalCars] = await db.select({ count: sql<number>`count(*)` }).from(cars);
  const [totalParts] = await db.select({ count: sql<number>`count(*)` }).from(spareParts);
  const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [revenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
    .from(orders)
    .where(inArray(orders.status, ["confirmed", "processing", "shipped", "delivered"]));
  const [pendingOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [availableCars] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(eq(cars.status, "available"));
  const [lowStockParts] = await db
    .select({ count: sql<number>`count(*)` })
    .from(spareParts)
    .where(and(eq(spareParts.active, true), sql`${spareParts.stock} <= ${spareParts.lowStockThreshold}`));

  return {
    totalCars: Number(totalCars?.count ?? 0),
    totalParts: Number(totalParts?.count ?? 0),
    totalOrders: Number(totalOrders?.count ?? 0),
    totalUsers: Number(totalUsers?.count ?? 0),
    totalRevenue: Number(revenue?.total ?? 0),
    pendingOrders: Number(pendingOrders?.count ?? 0),
    availableCars: Number(availableCars?.count ?? 0),
    lowStockParts: Number(lowStockParts?.count ?? 0),
  };
}
