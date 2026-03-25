import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getCars: vi.fn().mockResolvedValue([
    { id: 1, make: "Toyota", model: "Camry", year: 2023, price: "32500.00", condition: "new", status: "available", featured: true, mileage: 0 },
  ]),
  getCarById: vi.fn().mockResolvedValue({
    id: 1, make: "Toyota", model: "Camry", year: 2023, price: "32500.00", condition: "new", status: "available", mileage: 0,
  }),
  getImagesByCarId: vi.fn().mockResolvedValue([]),
  getImagesByPartId: vi.fn().mockResolvedValue([]),
  getDistinctCarMakes: vi.fn().mockResolvedValue(["Toyota", "BMW", "Honda"]),
  getSpareParts: vi.fn().mockResolvedValue([
    { id: 1, name: "Oil Filter", sku: "ENG-OIL-001", category: "engine", price: "12.99", stock: 150, brand: "Bosch", featured: true, active: true },
  ]),
  getSparePartById: vi.fn().mockResolvedValue({
    id: 1, name: "Oil Filter", sku: "ENG-OIL-001", category: "engine", price: "12.99", stock: 150, brand: "Bosch",
  }),
  getOrCreateCart: vi.fn().mockResolvedValue({ id: 1, userId: 1 }),
  getCartItems: vi.fn().mockResolvedValue([]),
  addCartItem: vi.fn().mockResolvedValue(undefined),
  updateCartItemQuantity: vi.fn().mockResolvedValue(undefined),
  removeCartItem: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue({ id: 1, orderNumber: "AM-TEST-001" }),
  getOrdersByUserId: vi.fn().mockResolvedValue([
    { id: 1, orderNumber: "AM-TEST-001", status: "pending", total: "100.00", createdAt: new Date() },
  ]),
  getOrderById: vi.fn().mockResolvedValue({
    id: 1, orderNumber: "AM-TEST-001", userId: 1, status: "pending", total: "100.00",
    subtotal: "85.00", tax: "7.00", shipping: "8.00", customerName: "Test User",
    customerEmail: "test@example.com", createdAt: new Date(),
  }),
  getOrderItems: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  getAdminStats: vi.fn().mockResolvedValue({
    totalCars: 10, availableCars: 8, totalParts: 18, lowStockParts: 2,
    totalOrders: 5, pendingOrders: 2, totalRevenue: 150000, totalUsers: 25,
  }),
  getAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "Admin User", email: "admin@test.com", role: "admin", createdAt: new Date() },
  ]),
  createCar: vi.fn().mockResolvedValue(undefined),
  updateCar: vi.fn().mockResolvedValue(undefined),
  deleteCar: vi.fn().mockResolvedValue(undefined),
  createSparePart: vi.fn().mockResolvedValue(undefined),
  updateSparePart: vi.fn().mockResolvedValue(undefined),
  deleteSparePart: vi.fn().mockResolvedValue(undefined),
  addProductImage: vi.fn().mockResolvedValue(undefined),
  deleteProductImage: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// ─── Context factories ────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function makeUserCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", name: "Test User", email: "test@example.com",
      loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("cars.list", () => {
  it("returns car list for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.cars.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("make", "Toyota");
  });

  it("returns car list with no input", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.cars.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("cars.detail", () => {
  it("returns a single car by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.cars.detail({ id: 1 });
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("make", "Toyota");
    expect(result).toHaveProperty("images");
  });
});

describe("cars.makes", () => {
  it("returns distinct car makes", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.cars.makes();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toContain("Toyota");
  });
});

describe("parts.list", () => {
  it("returns parts list for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.parts.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("name", "Oil Filter");
  });
});

describe("parts.detail", () => {
  it("returns a single part by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.parts.detail({ id: 1 });
    expect(result).toHaveProperty("sku", "ENG-OIL-001");
    expect(result).toHaveProperty("images");
  });
});

describe("cart.get", () => {
  it("returns empty cart for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.cart.get();
    expect(result).toHaveProperty("items");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.cart.get()).rejects.toThrow();
  });
});

describe("cart.addItem", () => {
  it("adds a part to cart", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.cart.addItem({ partId: 1, quantity: 2 });
    expect(result).toHaveProperty("success", true);
  });

  it("adds a car to cart", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.cart.addItem({ carId: 1, quantity: 1 });
    expect(result).toHaveProperty("success", true);
  });

  it("throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.cart.addItem({ partId: 1, quantity: 1 })).rejects.toThrow();
  });
});

describe("orders.myOrders", () => {
  it("returns user orders", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.orders.myOrders()).rejects.toThrow();
  });
});

describe("orders.detail", () => {
  it("returns order detail for owner", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.orders.detail({ id: 1 });
    expect(result).toHaveProperty("orderNumber", "AM-TEST-001");
    expect(result).toHaveProperty("items");
  });
});

describe("admin.stats", () => {
  it("returns stats for admin user", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalCars");
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("totalRevenue");
  });

  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

describe("admin.users", () => {
  it("returns user list for admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.users();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result).toHaveProperty("email", "test@example.com");
  });
});
