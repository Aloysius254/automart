import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Package, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { key: "engine", label: "Engine", icon: "⚙️" },
  { key: "brakes", label: "Brakes", icon: "🛑" },
  { key: "suspension", label: "Suspension", icon: "🔧" },
  { key: "electrical", label: "Electrical", icon: "⚡" },
  { key: "body", label: "Body", icon: "🚗" },
  { key: "interior", label: "Interior", icon: "🪑" },
  { key: "exhaust", label: "Exhaust", icon: "💨" },
  { key: "transmission", label: "Transmission", icon: "⚙️" },
  { key: "cooling", label: "Cooling", icon: "❄️" },
  { key: "fuel", label: "Fuel", icon: "⛽" },
  { key: "filters", label: "Filters", icon: "🔩" },
  { key: "lighting", label: "Lighting", icon: "💡" },
  { key: "tyres", label: "Tyres", icon: "🔄" },
  { key: "accessories", label: "Accessories", icon: "🎯" },
  { key: "other", label: "Other", icon: "📦" },
];

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price));
}

export default function Parts() {
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.includes("?") ? location.split("?")[1] : ""), [location]);

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") ?? "");
  const [compatibleMake, setCompatibleMake] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    search: params.get("search") ?? "",
    category: params.get("category") ?? "",
    compatibleMake: "",
  });

  const partsQuery = trpc.parts.list.useQuery({
    search: appliedFilters.search || undefined,
    category: appliedFilters.category || undefined,
    compatibleMake: appliedFilters.compatibleMake || undefined,
    limit: 60,
  });

  const applyFilters = () => {
    setAppliedFilters({ search, category: selectedCategory, compatibleMake });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch(""); setSelectedCategory(""); setCompatibleMake("");
    setAppliedFilters({ search: "", category: "", compatibleMake: "" });
  };

  const hasActiveFilters = appliedFilters.search || appliedFilters.category || appliedFilters.compatibleMake;

  const activeCategoryLabel = CATEGORIES.find((c) => c.key === appliedFilters.category)?.label;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header */}
      <div className="bg-foreground text-background py-10">
        <div className="container">
          <p className="text-sm text-background/50 mb-1">AutoMart</p>
          <h1 className="font-display text-4xl font-bold text-background">Spare Parts</h1>
          <p className="text-background/60 mt-2">Genuine parts for all makes and models</p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(""); setAppliedFilters((p) => ({ ...p, category: "" })); }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!appliedFilters.category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            All Parts
          </button>
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setSelectedCategory(key); setAppliedFilters((p) => ({ ...p, category: key })); }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${appliedFilters.category === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search parts by name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-10"
            />
          </div>
          <Button onClick={applyFilters} className="gap-2 shrink-0">
            <Search className="w-4 h-4" /> Search
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1.5 text-muted-foreground shrink-0">
              <X className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card-elegant p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <Select value={selectedCategory || "_all"} onValueChange={(v) => setSelectedCategory(v === "_all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Compatible Make</label>
                <Input
                  placeholder="e.g. Toyota, Honda..."
                  value={compatibleMake}
                  onChange={(e) => setCompatibleMake(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={clearFilters} size="sm">Clear All</Button>
              <Button onClick={applyFilters} size="sm">Apply Filters</Button>
            </div>
          </div>
        )}

        {/* Active Category Header */}
        {activeCategoryLabel && (
          <div className="flex items-center gap-2 mb-5">
            <h2 className="font-display text-xl font-semibold text-foreground">{activeCategoryLabel}</h2>
            <button onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-5">
          {partsQuery.isLoading ? "Loading..." : `${partsQuery.data?.length ?? 0} parts found`}
        </p>

        {/* Parts Grid */}
        {partsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : partsQuery.data?.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No parts found</h3>
            <p className="text-muted-foreground mb-5">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {partsQuery.data?.map((part) => {
              const primaryImage = (part as any).images?.find((i: any) => i.isPrimary) ?? (part as any).images?.[0];
              const categoryInfo = CATEGORIES.find((c) => c.key === part.category);
              return (
                <Link key={part.id} href={`/parts/${part.id}`}>
                  <div className="card-elegant hover-lift overflow-hidden group cursor-pointer">
                    <div className="relative h-40 bg-muted overflow-hidden">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">{categoryInfo?.icon ?? "📦"}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className={`text-xs font-medium bg-background/90 ${part.stock > 0 ? "text-emerald-600 border-emerald-200" : "text-red-500 border-red-200"}`}>
                          {part.stock > 0 ? `${part.stock} in stock` : "Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{categoryInfo?.icon}</span>
                        <span className="text-xs text-muted-foreground capitalize">{part.category}</span>
                        {part.brand && <span className="text-xs text-muted-foreground">· {part.brand}</span>}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 mb-1">{part.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mb-2">SKU: {part.sku}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="font-display font-bold text-primary text-lg">{formatPrice(part.price)}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
