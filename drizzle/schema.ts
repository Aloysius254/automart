import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Cars ─────────────────────────────────────────────────────────────────────
export const cars = mysqlTable("cars", {
  id: int("id").autoincrement().primaryKey(),
  make: varchar("make", { length: 64 }).notNull(),
  model: varchar("model", { length: 64 }).notNull(),
  year: int("year").notNull(),
  trim: varchar("trim", { length: 64 }),
  color: varchar("color", { length: 64 }),
  mileage: int("mileage").notNull().default(0),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  condition: mysqlEnum("condition", ["new", "used", "certified"]).notNull().default("used"),
  transmission: mysqlEnum("transmission", ["automatic", "manual", "cvt"]).default("automatic"),
  fuelType: mysqlEnum("fuelType", ["petrol", "diesel", "electric", "hybrid"]).default("petrol"),
  bodyType: mysqlEnum("bodyType", ["sedan", "suv", "hatchback", "coupe", "truck", "van", "convertible", "wagon"]).default("sedan"),
  engineSize: varchar("engineSize", { length: 32 }),
  doors: int("doors").default(4),
  seats: int("seats").default(5),
  vin: varchar("vin", { length: 17 }),
  description: text("description"),
  features: text("features"), // JSON array stored as text
  status: mysqlEnum("status", ["available", "sold", "reserved", "draft"]).notNull().default("available"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

// ─── Spare Parts ──────────────────────────────────────────────────────────────
export const spareParts = mysqlTable("spare_parts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  category: mysqlEnum("category", [
    "engine",
    "brakes",
    "suspension",
    "electrical",
    "body",
    "interior",
    "exhaust",
    "transmission",
    "cooling",
    "fuel",
    "filters",
    "lighting",
    "tyres",
    "accessories",
    "other",
  ]).notNull().default("other"),
  brand: varchar("brand", { length: 64 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").notNull().default(0),
  lowStockThreshold: int("lowStockThreshold").default(5),
  compatibleMakes: text("compatibleMakes"),   // JSON array: ["Toyota","Honda"]
  compatibleModels: text("compatibleModels"), // JSON array: ["Camry","Civic"]
  compatibleYears: text("compatibleYears"),   // JSON array: [2018,2019,2020]
  description: text("description"),
  weight: decimal("weight", { precision: 8, scale: 2 }), // kg
  dimensions: varchar("dimensions", { length: 64 }),
  warranty: varchar("warranty", { length: 64 }),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SparePart = typeof spareParts.$inferSelect;
export type InsertSparePart = typeof spareParts.$inferInsert;

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId"),
  partId: int("partId"),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 255 }),
  isPrimary: boolean("isPrimary").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  partId: int("partId"), // null if car
  carId: int("carId"),   // null if part
  quantity: int("quantity").notNull().default(1),
  priceAtAdd: decimal("priceAtAdd", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]).notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  // Customer info snapshot
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  shippingAddress: text("shippingAddress"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  partId: int("partId"),
  carId: int("carId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  productSku: varchar("productSku", { length: 64 }),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
