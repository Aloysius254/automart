import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Car, ChevronRight, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const BODY_TYPES = ["sedan", "suv", "hatchback", "coupe", "truck", "van", "convertible", "wagon"];
const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid"];
const TRANSMISSIONS = ["automatic", "manual", "cvt"];
const CONDITIONS = ["new", "used", "certified"];

export default function Cars() {
  const { formatPrice } = useCurrency();
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.includes("?") ? location.split("?")[1] : ""), [location]);

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [make, setMake] = useState(params.get("make") ?? "");
  const [condition, setCondition] = useState(params.get("condition") ?? "");
  const [bodyType, setBodyType] = useState(params.get("bodyType") ?? "");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    search: params.get("search") ?? "",
    make: params.get("make") ?? "",
    condition: params.get("condition") ?? "",
    bodyType: params.get("bodyType") ?? "",
    transmission: "",
    fuelType: "",
    priceMin: 0,
    priceMax: 500000,
    featured: params.get("featured") === "true" ? true : undefined,
  });

  const carsQuery = trpc.cars.list.useQuery({
    search: appliedFilters.search || undefined,
    make: appliedFilters.make || undefined,
    condition: appliedFilters.condition || undefined,
    bodyType: appliedFilters.bodyType || undefined,
    transmission: appliedFilters.transmission || undefined,
    fuelType: appliedFilters.fuelType || undefined,
    priceMin: appliedFilters.priceMin > 0 ? appliedFilters.priceMin : undefined,
    priceMax: appliedFilters.priceMax < 500000 ? appliedFilters.priceMax : undefined,
    featured: appliedFilters.featured,
    limit: 50,
  });

  const makesQuery = trpc.cars.makes.useQuery();

  const applyFilters = () => {
    setAppliedFilters({
      search,
      make,
      condition,
      bodyType,
      transmission,
      fuelType,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      featured: undefined,
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch(""); setMake(""); setCondition(""); setBodyType("");
    setTransmission(""); setFuelType(""); setPriceRange([0, 500000]);
    setAppliedFilters({ search: "", make: "", condition: "", bodyType: "", transmission: "", fuelType: "", priceMin: 0, priceMax: 500000, featured: undefined });
  };

  const hasActiveFilters = appliedFilters.search || appliedFilters.make || appliedFilters.condition || appliedFilters.bodyType || appliedFilters.transmission || appliedFilters.fuelType || appliedFilters.priceMin > 0 || appliedFilters.priceMax < 500000;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header */}
      <div className="bg-foreground text-background py-10">
        <div className="container">
          <p className="text-sm text-background/50 mb-1">AutoMart</p>
          <h1 className="font-display text-4xl font-bold text-background">Browse Vehicles</h1>
          <p className="text-background/60 mt-2">Find your perfect car from our premium inventory</p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, keyword..."
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
            <SlidersHorizontal className="w-4 h-4" />
            Filters
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Make</label>
                <Select value={make || "_all"} onValueChange={(v) => setMake(v === "_all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Makes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Makes</SelectItem>
                    {makesQuery.data?.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Condition</label>
                <Select value={condition || "_all"} onValueChange={(v) => setCondition(v === "_all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Any Condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Any Condition</SelectItem>
                    {CONDITIONS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c === "certified" ? "Certified Pre-Owned" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body Type</label>
                <Select value={bodyType || "_all"} onValueChange={(v) => setBodyType(v === "_all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Any Body Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Any Body Type</SelectItem>
                    {BODY_TYPES.map((b) => <SelectItem key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fuel Type</label>
                <Select value={fuelType || "_all"} onValueChange={(v) => setFuelType(v === "_all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Any Fuel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Any Fuel Type</SelectItem>
                    {FUEL_TYPES.map((f) => <SelectItem key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Price Range: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
              </label>
              <Slider
                min={0} max={500000} step={5000}
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={clearFilters} size="sm">Clear All</Button>
              <Button onClick={applyFilters} size="sm">Apply Filters</Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {carsQuery.isLoading ? "Loading..." : `${carsQuery.data?.length ?? 0} vehicles found`}
          </p>
        </div>

        {/* Cars Grid */}
        {carsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
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
        ) : carsQuery.data?.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-5">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carsQuery.data?.map((car) => {
              const primaryImage = (car as any).images?.find((i: any) => i.isPrimary) ?? (car as any).images?.[0];
              return (
                <Link key={car.id} href={`/cars/${car.id}`}>
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
                          {car.condition === "certified" ? "CPO" : car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                        </Badge>
                      </div>
                      {car.featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
                        {car.year} {car.make} {car.model}
                      </h3>
                      {car.trim && <p className="text-sm text-muted-foreground mt-0.5">{car.trim}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {car.mileage > 0 && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{car.mileage.toLocaleString()} mi</span>}
                        {car.transmission && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">{car.transmission}</span>}
                        {car.bodyType && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">{car.bodyType}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="price-tag">{formatPrice(car.price)}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Details <ChevronRight className="w-3.5 h-3.5" />
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
