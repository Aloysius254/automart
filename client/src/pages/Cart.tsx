import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Car, Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Cart() {
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });

  const updateQty = trpc.cart.updateQuantity.useMutation({
    onMutate: async ({ itemId, quantity }) => {
      await utils.cart.get.cancel();
      const prev = utils.cart.get.getData();
      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: quantity === 0 ? old.items.filter((i) => i.id !== itemId) : old.items.map((i) => i.id === itemId ? { ...i, quantity } : i),
        };
      });
      return { prev };
    },
    onError: (_, __, ctx) => { if (ctx?.prev) utils.cart.get.setData(undefined, ctx.prev); },
    onSettled: () => utils.cart.get.invalidate(),
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onMutate: async ({ itemId }) => {
      await utils.cart.get.cancel();
      const prev = utils.cart.get.getData();
      utils.cart.get.setData(undefined, (old) => old ? { ...old, items: old.items.filter((i) => i.id !== itemId) } : old);
      return { prev };
    },
    onError: (_, __, ctx) => { if (ctx?.prev) utils.cart.get.setData(undefined, ctx.prev); },
    onSettled: () => utils.cart.get.invalidate(),
    onSuccess: () => toast.success("Item removed"),
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success("Cart cleared"); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Sign In to View Cart</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access your shopping cart.</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + parseFloat(String(item.priceAtAdd)) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : items.length > 0 ? 25 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-foreground text-background py-10">
        <div className="container">
          <h1 className="font-display text-4xl font-bold text-background">Shopping Cart</h1>
          <p className="text-background/60 mt-1">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {cartQuery.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some vehicles or spare parts to get started.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/cars"><Button variant="outline" className="gap-2"><Car className="w-4 h-4" /> Browse Cars</Button></Link>
              <Link href="/parts"><Button className="gap-2"><Package className="w-4 h-4" /> Browse Parts</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Items</h2>
                <Button variant="ghost" size="sm" onClick={() => clearCart.mutate()} className="text-muted-foreground gap-1.5 text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product as any;
                  const primaryImage = (item.images as any[])?.find((i) => i.isPrimary) ?? (item.images as any[])?.[0];
                  const isCarItem = !!item.carId;
                  const productName = isCarItem
                    ? `${product?.year} ${product?.make} ${product?.model}`
                    : product?.name ?? "Unknown Item";
                  const itemTotal = parseFloat(String(item.priceAtAdd)) * item.quantity;

                  return (
                    <div key={item.id} className="card-elegant p-4 flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        {primaryImage ? (
                          <img src={primaryImage.url} alt={productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {isCarItem ? <Car className="w-8 h-8 text-muted-foreground/30" /> : <Package className="w-8 h-8 text-muted-foreground/30" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link href={isCarItem ? `/cars/${item.carId}` : `/parts/${item.partId}`}>
                              <h4 className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">{productName}</h4>
                            </Link>
                            {!isCarItem && product?.sku && (
                              <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(parseFloat(String(item.priceAtAdd)))} each</p>
                          </div>
                          <button onClick={() => removeItem.mutate({ itemId: item.id })} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          {isCarItem ? (
                            <span className="text-xs text-muted-foreground">Qty: 1 (vehicle)</span>
                          ) : (
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <button onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })} className="px-2 py-1 hover:bg-muted transition-colors">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold min-w-8 text-center">{item.quantity}</span>
                              <button onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="px-2 py-1 hover:bg-muted transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          <span className="font-display font-bold text-primary">{formatPrice(itemTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="card-elegant p-5 sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : ""}`}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">Free shipping on orders over $500</p>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold text-lg mb-5">
                  <span>Total</span>
                  <span className="price-tag">{formatPrice(total)}</span>
                </div>
                <Link href="/checkout">
                  <Button size="lg" className="w-full gap-2">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="mt-3 flex gap-2">
                  <Link href="/cars" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      <Car className="w-3.5 h-3.5" /> Cars
                    </Button>
                  </Link>
                  <Link href="/parts" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Parts
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
