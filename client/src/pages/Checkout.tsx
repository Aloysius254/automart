import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, Lock, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    customerEmail: user?.email ?? "",
    customerPhone: "",
    shippingAddress: "",
    notes: "",
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setOrderPlaced(true);
      utils.cart.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Sign In to Checkout</h2>
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
          <p className="text-sm font-mono bg-muted px-4 py-2 rounded-lg inline-block mb-6">{orderNumber}</p>
          <p className="text-sm text-muted-foreground mb-8">We'll send you updates on your order status. You can track your order in your account.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders"><Button size="lg" className="gap-2">View My Orders <ChevronRight className="w-4 h-4" /></Button></Link>
            <Link href="/"><Button variant="outline" size="lg">Continue Shopping</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cartQuery.data?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + parseFloat(String(item.priceAtAdd)) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : items.length > 0 ? 25 : 0;
  const total = subtotal + tax + shipping;

  if (!cartQuery.isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h2>
          <Link href="/cars"><Button size="lg">Browse Cars</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    createOrder.mutate(form);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-foreground text-background py-10">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-background/50 mb-1">
            <Link href="/cart" className="hover:text-background/80">Cart</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-background">Checkout</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-background">Checkout</h1>
        </div>
      </div>

      <div className="container py-8 flex-1">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-elegant p-6">
                <h2 className="font-display text-xl font-semibold mb-5">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={form.customerName}
                      onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.customerPhone}
                      onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="card-elegant p-6">
                <h2 className="font-display text-xl font-semibold mb-5">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      value={form.shippingAddress}
                      onChange={(e) => setForm((p) => ({ ...p, shippingAddress: e.target.value }))}
                      placeholder="123 Main Street, City, State, ZIP"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any special instructions..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="card-elegant p-5 sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>

                {cartQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {items.map((item) => {
                      const product = item.product as any;
                      const isCarItem = !!item.carId;
                      const productName = isCarItem ? `${product?.year} ${product?.make} ${product?.model}` : product?.name ?? "Unknown";
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                            {(item.images as any[])?.[0] ? (
                              <img src={(item.images as any[])[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground line-clamp-1">{productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0">
                            {formatPrice(parseFloat(String(item.priceAtAdd)) * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Separator className="mb-3" />
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-600" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                </div>
                <Separator className="mb-3" />
                <div className="flex justify-between font-semibold text-lg mb-5">
                  <span>Total</span>
                  <span className="price-tag">{formatPrice(total)}</span>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={createOrder.isPending || items.length === 0}>
                  <Lock className="w-4 h-4" />
                  {createOrder.isPending ? "Placing Order..." : "Place Order"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secure checkout
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
