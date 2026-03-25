import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addCartItem,
  addProductImage,
  clearCart,
  createCar,
  createOrder,
  createSparePart,
  deleteCar,
  deleteProductImage,
  deleteSparePart,
  getAdminStats,
  getAllOrders,
  getAllUsers,
  getCarById,
  getCars,
  getCartItems,
  getDistinctCarMakes,
  getImagesByCarId,
  getImagesByPartId,
  getOrCreateCart,
  getOrderById,
  getOrderItems,
  getOrdersByUserId,
  getSparePartById,
  getSpareParts,
  removeCartItem,
  updateCar,
  updateCartItemQuantity,
  updateOrderStatus,
  updateSparePart,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// ─── Cars Router ──────────────────────────────────────────────────────────────
const carsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        yearMin: z.number().optional(),
        yearMax: z.number().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        condition: z.string().optional(),
        bodyType: z.string().optional(),
        transmission: z.string().optional(),
        fuelType: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const carList = await getCars(input ?? {});
      const carsWithImages = await Promise.all(
        carList.map(async (car) => {
          const images = await getImagesByCarId(car.id);
          return { ...car, images };
        })
      );
      return carsWithImages;
    }),

  detail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const car = await getCarById(input.id);
      if (!car) throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
      const images = await getImagesByCarId(car.id);
      return { ...car, images };
    }),

  makes: publicProcedure.query(() => getDistinctCarMakes()),

  // Admin CRUD
  create: adminProcedure
    .input(
      z.object({
        make: z.string(),
        model: z.string(),
        year: z.number(),
        trim: z.string().optional(),
        color: z.string().optional(),
        mileage: z.number().default(0),
        price: z.string(),
        condition: z.enum(["new", "used", "certified"]).default("used"),
        transmission: z.enum(["automatic", "manual", "cvt"]).optional(),
        fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]).optional(),
        bodyType: z.enum(["sedan", "suv", "hatchback", "coupe", "truck", "van", "convertible", "wagon"]).optional(),
        engineSize: z.string().optional(),
        doors: z.number().optional(),
        seats: z.number().optional(),
        vin: z.string().optional(),
        description: z.string().optional(),
        features: z.string().optional(),
        status: z.enum(["available", "sold", "reserved", "draft"]).default("available"),
        featured: z.boolean().default(false),
        images: z.array(z.object({ url: z.string(), altText: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { images, ...carData } = input;
      await createCar(carData);
      const cars = await getCars({ status: "available", limit: 1 });
      // Get the last inserted car
      const allCars = await getCars({ limit: 1000 });
      const newCar = allCars.sort((a, b) => b.id - a.id)[0];
      if (newCar && images?.length) {
        await Promise.all(
          images.map((img, i) =>
            addProductImage({ carId: newCar.id, url: img.url, altText: img.altText, isPrimary: img.isPrimary ?? i === 0, sortOrder: i })
          )
        );
      }
      return { success: true, id: newCar?.id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        trim: z.string().optional(),
        color: z.string().optional(),
        mileage: z.number().optional(),
        price: z.string().optional(),
        condition: z.enum(["new", "used", "certified"]).optional(),
        transmission: z.enum(["automatic", "manual", "cvt"]).optional(),
        fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]).optional(),
        bodyType: z.enum(["sedan", "suv", "hatchback", "coupe", "truck", "van", "convertible", "wagon"]).optional(),
        engineSize: z.string().optional(),
        doors: z.number().optional(),
        seats: z.number().optional(),
        vin: z.string().optional(),
        description: z.string().optional(),
        features: z.string().optional(),
        status: z.enum(["available", "sold", "reserved", "draft"]).optional(),
        featured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCar(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCar(input.id);
      return { success: true };
    }),

  addImage: adminProcedure
    .input(z.object({ carId: z.number(), url: z.string(), altText: z.string().optional(), isPrimary: z.boolean().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ input }) => {
      await addProductImage(input);
      return { success: true };
    }),

  deleteImage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProductImage(input.id);
      return { success: true };
    }),
});

// ─── Parts Router ─────────────────────────────────────────────────────────────
const partsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        brand: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        compatibleMake: z.string().optional(),
        compatibleModel: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const partList = await getSpareParts(input ?? {});
      const partsWithImages = await Promise.all(
        partList.map(async (part) => {
          const images = await getImagesByPartId(part.id);
          return { ...part, images };
        })
      );
      return partsWithImages;
    }),

  detail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const part = await getSparePartById(input.id);
      if (!part) throw new TRPCError({ code: "NOT_FOUND", message: "Part not found" });
      const images = await getImagesByPartId(part.id);
      return { ...part, images };
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        sku: z.string(),
        category: z.enum(["engine","brakes","suspension","electrical","body","interior","exhaust","transmission","cooling","fuel","filters","lighting","tyres","accessories","other"]),
        brand: z.string().optional(),
        price: z.string(),
        stock: z.number().default(0),
        lowStockThreshold: z.number().optional(),
        compatibleMakes: z.string().optional(),
        compatibleModels: z.string().optional(),
        compatibleYears: z.string().optional(),
        description: z.string().optional(),
        weight: z.string().optional(),
        dimensions: z.string().optional(),
        warranty: z.string().optional(),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        images: z.array(z.object({ url: z.string(), altText: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { images, ...partData } = input;
      await createSparePart(partData);
      const allParts = await getSpareParts({ active: false, limit: 1000 });
      const newPart = allParts.sort((a, b) => b.id - a.id)[0];
      if (newPart && images?.length) {
        await Promise.all(
          images.map((img, i) =>
            addProductImage({ partId: newPart.id, url: img.url, altText: img.altText, isPrimary: img.isPrimary ?? i === 0, sortOrder: i })
          )
        );
      }
      return { success: true, id: newPart?.id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        category: z.enum(["engine","brakes","suspension","electrical","body","interior","exhaust","transmission","cooling","fuel","filters","lighting","tyres","accessories","other"]).optional(),
        brand: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        compatibleMakes: z.string().optional(),
        compatibleModels: z.string().optional(),
        compatibleYears: z.string().optional(),
        description: z.string().optional(),
        weight: z.string().optional(),
        dimensions: z.string().optional(),
        warranty: z.string().optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSparePart(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSparePart(input.id);
      return { success: true };
    }),

  addImage: adminProcedure
    .input(z.object({ partId: z.number(), url: z.string(), altText: z.string().optional(), isPrimary: z.boolean().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ input }) => {
      await addProductImage(input);
      return { success: true };
    }),
});

// ─── Cart Router ──────────────────────────────────────────────────────────────
const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    const items = await getCartItems(cart.id);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let product = null;
        let images: any[] = [];
        if (item.partId) {
          product = await getSparePartById(item.partId);
          images = await getImagesByPartId(item.partId);
        } else if (item.carId) {
          product = await getCarById(item.carId);
          images = await getImagesByCarId(item.carId);
        }
        return { ...item, product, images };
      })
    );

    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + parseFloat(String(item.priceAtAdd)) * item.quantity,
      0
    );

    return { cart, items: enrichedItems, subtotal };
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        partId: z.number().optional(),
        carId: z.number().optional(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);
      let price = "0";

      if (input.partId) {
        const part = await getSparePartById(input.partId);
        if (!part) throw new TRPCError({ code: "NOT_FOUND", message: "Part not found" });
        if (part.stock < input.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
        price = String(part.price);
      } else if (input.carId) {
        const car = await getCarById(input.carId);
        if (!car) throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
        price = String(car.price);
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Must provide partId or carId" });
      }

      await addCartItem({ cartId: cart.id, partId: input.partId, carId: input.carId, quantity: input.quantity, priceAtAdd: price });
      return { success: true };
    }),

  updateQuantity: protectedProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().min(0) }))
    .mutation(async ({ input }) => {
      await updateCartItemQuantity(input.itemId, input.quantity);
      return { success: true };
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      await removeCartItem(input.itemId);
      return { success: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    await clearCart(cart.id);
    return { success: true };
  }),
});

// ─── Orders Router ────────────────────────────────────────────────────────────
const ordersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);
      const items = await getCartItems(cart.id);

      if (items.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });

      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          if (item.partId) {
            const part = await getSparePartById(item.partId);
            return { ...item, name: part?.name ?? "Unknown Part", sku: part?.sku };
          } else if (item.carId) {
            const car = await getCarById(item.carId);
            return { ...item, name: car ? `${car.year} ${car.make} ${car.model}` : "Unknown Car", sku: car?.vin };
          }
          return { ...item, name: "Unknown", sku: undefined };
        })
      );

      const subtotal = enrichedItems.reduce(
        (sum, item) => sum + parseFloat(String(item.priceAtAdd)) * item.quantity,
        0
      );
      const tax = subtotal * 0.08;
      const shipping = subtotal > 500 ? 0 : 25;
      const total = subtotal + tax + shipping;

      const orderNumber = `AM-${Date.now()}-${nanoid(6).toUpperCase()}`;

      const order = await createOrder(
        {
          userId: ctx.user.id,
          orderNumber,
          subtotal: String(subtotal.toFixed(2)),
          tax: String(tax.toFixed(2)),
          shipping: String(shipping.toFixed(2)),
          total: String(total.toFixed(2)),
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        },
        enrichedItems.map((item) => ({
          orderId: 0, // will be set in createOrder
          partId: item.partId ?? undefined,
          carId: item.carId ?? undefined,
          productName: item.name,
          productSku: item.sku,
          quantity: item.quantity,
          unitPrice: String(item.priceAtAdd),
          subtotal: String((parseFloat(String(item.priceAtAdd)) * item.quantity).toFixed(2)),
        }))
      );

      await clearCart(cart.id);
      return { success: true, orderNumber, orderId: order.id };
    }),

  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return getOrdersByUserId(ctx.user.id);
  }),

  detail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),

  // Admin
  adminList: adminProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return getAllOrders(input?.limit, input?.offset);
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending","confirmed","processing","shipped","delivered","cancelled","refunded"]) }))
    .mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  stats: adminProcedure.query(() => getAdminStats()),
  users: adminProcedure.query(() => getAllUsers()),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  cars: carsRouter,
  parts: partsRouter,
  cart: cartRouter,
  orders: ordersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
