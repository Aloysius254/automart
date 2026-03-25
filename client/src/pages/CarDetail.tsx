import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Info,
  Palette,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(price));
}

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [activeImg, setActiveImg] = useState(0);

  const carQuery = trpc.cars.detail.useQuery({ id: Number(id) });
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      utils.cart.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const car = carQuery.data;
  const images = (car as any)?.images ?? [];

  if (carQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-semibold mb-2">Vehicle Not Found</h2>
          <p className="text-muted-foreground mb-5">This vehicle may have been sold or removed.</p>
          <Link href="/cars"><Button>Browse All Cars</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const features = car.features ? JSON.parse(car.features) : [];

  const specs = [
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Gauge, label: "Mileage", value: car.mileage > 0 ? `${car.mileage.toLocaleString()} mi` : "Brand New" },
    { icon: Settings, label: "Transmission", value: car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) : "—" },
    { icon: Fuel, label: "Fuel Type", value: car.fuelType ? car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1) : "—" },
    { icon: Car, label: "Body Type", value: car.bodyType ? car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1) : "—" },
    { icon: Palette, label: "Color", value: car.color ?? "—" },
    { icon: Users, label: "Seats", value: car.seats ?? "—" },
    { icon: Info, label: "Engine", value: car.engineSize ?? "—" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cars" className="hover:text-foreground transition-colors">Cars</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{car.year} {car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] mb-3">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]?.url}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-24 h-24 text-muted-foreground/20" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveImg((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, i: number) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? "bg-primary w-5" : "bg-background/60"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Info */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <Badge className={`text-xs font-medium ${car.condition === "new" ? "bg-emerald-100 text-emerald-700" : car.condition === "certified" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                {car.condition === "certified" ? "Certified Pre-Owned" : car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
              </Badge>
              {car.featured && <Badge className="bg-primary/10 text-primary border-primary/20">Featured</Badge>}
            </div>

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-1">
              {car.year} {car.make} {car.model}
            </h1>
            {car.trim && <p className="text-lg text-muted-foreground mb-4">{car.trim}</p>}

            <div className="price-tag text-4xl mb-6">{formatPrice(car.price)}</div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {specs.slice(0, 4).map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-muted/50 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {car.status === "available" ? (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => addToCart.mutate({ carId: car.id, quantity: 1 })}
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
            ) : (
              <div className="bg-muted rounded-xl p-4 mb-6 text-center">
                <p className="font-semibold text-muted-foreground capitalize">This vehicle is {car.status}</p>
              </div>
            )}

            <Separator className="mb-5" />

            {/* Full Specs */}
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">Full Specifications</h3>
              <div className="grid grid-cols-2 gap-y-3">
                {specs.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{String(value)}</p>
                  </div>
                ))}
                {car.vin && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">VIN</p>
                    <p className="text-sm font-medium text-foreground font-mono">{car.vin}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <>
                <Separator className="my-5" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-3">Features & Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f: string) => (
                      <span key={f} className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {car.description && (
              <>
                <Separator className="my-5" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>
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
