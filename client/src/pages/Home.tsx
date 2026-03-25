import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Car,
  CheckCircle,
  ChevronRight,
  Package,
  Search,
  Shield,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PART_CATEGORIES = [
  { key: "engine", label: "Engine", icon: "⚙️" },
  { key: "brakes", label: "Brakes", icon: "🛑" },
  { key: "suspension", label: "Suspension", icon: "🔧" },
  { key: "electrical", label: "Electrical", icon: "⚡" },
  { key: "filters", label: "Filters", icon: "🔩" },
  { key: "tyres", label: "Tyres", icon: "🔄" },
  { key: "lighting", label: "Lighting", icon: "💡" },
  { key: "accessories", label: "Accessories", icon: "🎯" },
];

const FEATURES = [
  { icon: Shield, title: "Quality Guaranteed", desc: "Every vehicle and part is thoroughly inspected and certified." },
  { icon: Truck, title: "Fast Delivery", desc: "Spare parts delivered to your door within 2-5 business days." },
  { icon: Wrench, title: "Expert Support", desc: "Our automotive specialists are available 7 days a week." },
  { icon: Zap, title: "Easy Returns", desc: "Hassle-free 30-day return policy on all spare parts." },
];

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(price));
}

function CarCard({ car }: { car: any }) {
  const primaryImage = car.images?.find((i: any) => i.isPrimary) ?? car.images?.[0];
  return (
    <Link href={`/cars/${car.id}`}>
      <div className="card-elegant hover-lift overflow-hidden group cursor-pointer">
        <div className="relative h-48 bg-muted overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage.url} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={`text-xs font-medium ${car.condition === "new" ? "bg-emerald-100 text-emerald-700" : car.condition === "certified" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {car.condition === "certified" ? "Certified Pre-Owned" : car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
            {car.year} {car.make} {car.model}
          </h3>
          {car.trim && <p className="text-sm text-muted-foreground mt-0.5">{car.trim}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {car.mileage > 0 && <span>{car.mileage.toLocaleString()} mi</span>}
            {car.transmission && <span className="capitalize">{car.transmission}</span>}
            {car.fuelType && <span className="capitalize">{car.fuelType}</span>}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="price-tag">{formatPrice(car.price)}</span>
            <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const featuredCars = trpc.cars.list.useQuery({ featured: true, limit: 6 });
  const featuredParts = trpc.parts.list.useQuery({ featured: true, limit: 4 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, oklch(0.62 0.15 55) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.45 0.1 220) 0%, transparent 40%)" }} />
        </div>
        <div className="container relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5" />
              Premium Automotive Marketplace
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
              Find Your Perfect{" "}
              <span className="text-primary">Drive</span>
            </h1>
            <p className="text-lg text-background/70 leading-relaxed mb-8 max-w-xl">
              Discover an exceptional collection of premium vehicles and genuine spare parts. Quality, trust, and performance — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-background/40" />
                <input
                  type="text"
                  placeholder="Search make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/10 border border-background/20 rounded-xl text-background placeholder:text-background/40 focus:outline-none focus:border-primary focus:bg-background/15 transition-all"
                />
              </div>
              <Button type="submit" size="lg" className="px-6 rounded-xl shrink-0">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link href="/cars">
                <Button variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background gap-2">
                  <Car className="w-4 h-4" /> Browse Cars
                </Button>
              </Link>
              <Link href="/parts">
                <Button variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background gap-2">
                  <Package className="w-4 h-4" /> Spare Parts
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-background/10">
          <div className="container py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "500+", label: "Vehicles Listed" },
                { value: "10,000+", label: "Spare Parts" },
                { value: "50,000+", label: "Happy Customers" },
                { value: "15+", label: "Years Experience" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-background/50 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Handpicked for You</p>
              <h2 className="section-heading">Featured Vehicles</h2>
            </div>
            <Link href="/cars">
              <Button variant="ghost" className="text-primary hover:text-primary gap-1.5 hidden sm:flex">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredCars.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCars.data?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No featured vehicles yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.data?.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/cars">
              <Button variant="outline" className="gap-2">View All Cars <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parts Categories */}
      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Genuine Parts</p>
              <h2 className="section-heading">Shop by Category</h2>
            </div>
            <Link href="/parts">
              <Button variant="ghost" className="text-primary hover:text-primary gap-1.5 hidden sm:flex">
                All Parts <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PART_CATEGORIES.map(({ key, label, icon }) => (
              <Link key={key} href={`/parts?category=${key}`}>
                <div className="card-elegant hover-lift p-4 text-center cursor-pointer group">
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Parts */}
          {featuredParts.data && featuredParts.data.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-semibold text-foreground mb-5">Featured Parts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredParts.data.map((part) => {
                  const primaryImage = (part as any).images?.find((i: any) => i.isPrimary) ?? (part as any).images?.[0];
                  return (
                    <Link key={part.id} href={`/parts/${part.id}`}>
                      <div className="card-elegant hover-lift overflow-hidden group cursor-pointer">
                        <div className="h-36 bg-muted overflow-hidden">
                          {primaryImage ? (
                            <img src={primaryImage.url} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground capitalize mb-0.5">{part.category}</p>
                          <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">{part.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-display font-bold text-primary">{formatPrice(part.price)}</span>
                            <Badge variant="outline" className={`text-xs ${part.stock > 0 ? "text-emerald-600 border-emerald-200" : "text-red-500 border-red-200"}`}>
                              {part.stock > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Why AutoMart</p>
            <h2 className="section-heading">The AutoMart Advantage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 bg-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-3">
            Ready to Find Your Next Car?
          </h2>
          <p className="text-primary-foreground/80 mb-7 max-w-md mx-auto">
            Browse our extensive inventory of premium vehicles and genuine spare parts today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/cars">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 font-semibold">
                <Car className="w-4 h-4" /> Browse Cars
              </Button>
            </Link>
            <Link href="/parts">
              <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                <Package className="w-4 h-4" /> Shop Parts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
