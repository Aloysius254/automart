import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price));
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

function OrderDetail({ orderId, onBack }: { orderId: number; onBack: () => void }) {
  const orderQuery = trpc.orders.detail.useQuery({ id: orderId });
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) return <div className="text-center py-10 text-muted-foreground">Order not found.</div>;

  const items = (order as any).items ?? [];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Orders
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge className={`${STATUS_COLORS[order.status] ?? ""} capitalize font-medium`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card-elegant p-5">
            <h3 className="font-display font-semibold text-lg mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-muted-foreground font-mono">SKU: {item.productSku}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                  </div>
                  <span className="font-semibold text-sm text-foreground shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card-elegant p-5">
            <h3 className="font-display font-semibold text-lg mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card-elegant p-5">
            <h3 className="font-display font-semibold text-lg mb-3">Customer Details</h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
              {order.shippingAddress && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shipping Address</p>
                  <p className="text-muted-foreground">{order.shippingAddress}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Sign In to View Orders</h2>
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-foreground text-background py-10">
        <div className="container">
          <h1 className="font-display text-4xl font-bold text-background">My Orders</h1>
          <p className="text-background/60 mt-1">Track and manage your purchases</p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {selectedOrderId ? (
          <OrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
        ) : ordersQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : ordersQuery.data?.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display text-2xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/cars"><Button variant="outline">Browse Cars</Button></Link>
              <Link href="/parts"><Button>Browse Parts</Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersQuery.data?.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full card-elegant p-5 text-left hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground font-mono text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge className={`${STATUS_COLORS[order.status] ?? ""} capitalize font-medium text-xs`}>{order.status}</Badge>
                    <span className="font-display font-bold text-primary hidden sm:block">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
