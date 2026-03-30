import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const CATEGORY_ICONS: Record<string, string> = {
  engine: "⚙️", brakes: "🛑", suspension: "🔧", electrical: "⚡", body: "🚗",
  interior: "🪑", exhaust: "💨", transmission: "⚙️", cooling: "❄️", fuel: "⛽",
  filters: "🔩", lighting: "💡", tyres: "🔄", accessories: "🎯", other: "📦",
};

export default function PartDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const partQuery = trpc.parts.detail.useQuery({ id: Number(id) });
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success(`${quantity} item(s) added to cart!`);
      utils.cart.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const part = partQuery.data;
  const images = (part as any)?.images ?? [];

  if (partQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Part Not Found</h2>
          <Link href="/parts"><Button>Browse All Parts</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const compatibleMakes = part.compatibleMakes ? JSON.parse(part.compatibleMakes) : [];
  const compatibleModels = part.compatibleModels ? JSON.parse(part.compatibleModels) : [];
  const compatibleYears = part.compatibleYears ? JSON.parse(part.compatibleYears) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/parts" className="hover:text-foreground">Parts</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground capitalize">{part.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-40">{part.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-square mb-3">
              {images.length > 0 ? (
                <img src={images[activeImg]?.url} alt={part.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">{CATEGORY_ICONS[part.category] ?? "📦"}</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveImg((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Part Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{CATEGORY_ICONS[part.category]}</span>
              <span className="text-sm text-muted-foreground capitalize">{part.category}</span>
              {part.brand && <span className="text-sm text-muted-foreground">· {part.brand}</span>}
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-1">{part.name}</h1>
            <p className="text-sm text-muted-foreground font-mono mb-4">SKU: {part.sku}</p>

            <div className="price-tag text-3xl mb-2">{formatPrice(part.price)}</div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${part.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${part.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {part.stock > 0 ? `${part.stock} units in stock` : "Out of Stock"}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            {part.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(part.stock, q + 1))} className="px-3 py-2 hover:bg-muted transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => addToCart.mutate({ partId: part.id, quantity })}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                ) : (
                  <Button size="lg" className="flex-1 gap-2" onClick={() => (window.location.href = getLoginUrl())}>
                    Sign In to Purchase
                  </Button>
                )}
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {part.warranty && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Warranty</p>
                  <p className="text-sm font-semibold text-foreground">{part.warranty}</p>
                </div>
              )}
              {part.weight && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-sm font-semibold text-foreground">{String(part.weight)} kg</p>
                </div>
              )}
              {part.dimensions && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <p className="text-sm font-semibold text-foreground">{part.dimensions}</p>
                </div>
              )}
            </div>

            {/* Compatibility */}
            {(compatibleMakes.length > 0 || compatibleModels.length > 0) && (
              <>
                <Separator className="mb-4" />
                <div className="mb-4">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-3">Compatibility</h3>
                  {compatibleMakes.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1.5">Compatible Makes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {compatibleMakes.map((m: string) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                      </div>
                    </div>
                  )}
                  {compatibleModels.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1.5">Compatible Models</p>
                      <div className="flex flex-wrap gap-1.5">
                        {compatibleModels.map((m: string) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                      </div>
                    </div>
                  )}
                  {compatibleYears.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Compatible Years</p>
                      <p className="text-sm text-foreground">{compatibleYears.join(", ")}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Description */}
            {part.description && (
              <>
                <Separator className="mb-4" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
