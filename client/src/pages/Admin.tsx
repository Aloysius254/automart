import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertTriangle,
  BarChart3,
  Car,
  CheckCircle,
  Edit,
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

type AdminTab = "overview" | "cars" | "parts" | "orders" | "users";

// ─── Car Form ─────────────────────────────────────────────────────────────────
function CarForm({ car, onSuccess }: { car?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    make: car?.make ?? "",
    model: car?.model ?? "",
    year: car?.year ?? new Date().getFullYear(),
    trim: car?.trim ?? "",
    color: car?.color ?? "",
    mileage: car?.mileage ?? 0,
    price: car?.price ?? "",
    condition: car?.condition ?? "used",
    transmission: car?.transmission ?? "automatic",
    fuelType: car?.fuelType ?? "petrol",
    bodyType: car?.bodyType ?? "sedan",
    engineSize: car?.engineSize ?? "",
    doors: car?.doors ?? 4,
    seats: car?.seats ?? 5,
    vin: car?.vin ?? "",
    description: car?.description ?? "",
    features: car?.features ?? "",
    status: car?.status ?? "available",
    featured: car?.featured ?? false,
    imageUrl: "",
  });

  const utils = trpc.useUtils();
  const createCar = trpc.cars.create.useMutation({
    onSuccess: () => { toast.success("Car added!"); utils.cars.list.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateCar = trpc.cars.update.useMutation({
    onSuccess: () => { toast.success("Car updated!"); utils.cars.list.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      make: form.make, model: form.model, year: Number(form.year),
      trim: form.trim || undefined, color: form.color || undefined,
      mileage: Number(form.mileage), price: String(form.price),
      condition: form.condition as any, transmission: form.transmission as any,
      fuelType: form.fuelType as any, bodyType: form.bodyType as any,
      engineSize: form.engineSize || undefined, doors: Number(form.doors),
      seats: Number(form.seats), vin: form.vin || undefined,
      description: form.description || undefined, features: form.features || undefined,
      status: form.status as any, featured: form.featured,
      images: form.imageUrl ? [{ url: form.imageUrl, isPrimary: true }] : undefined,
    };
    if (car) updateCar.mutate({ id: car.id, ...data });
    else createCar.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Make *</Label><Input value={form.make} onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))} placeholder="Toyota" required /></div>
        <div><Label>Model *</Label><Input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="Camry" required /></div>
        <div><Label>Year *</Label><Input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))} required /></div>
        <div><Label>Trim</Label><Input value={form.trim} onChange={(e) => setForm((p) => ({ ...p, trim: e.target.value }))} placeholder="XSE" /></div>
        <div><Label>Price *</Label><Input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="25000" required /></div>
        <div><Label>Mileage</Label><Input type="number" value={form.mileage} onChange={(e) => setForm((p) => ({ ...p, mileage: Number(e.target.value) }))} /></div>
        <div><Label>Color</Label><Input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} placeholder="Pearl White" /></div>
        <div><Label>Engine Size</Label><Input value={form.engineSize} onChange={(e) => setForm((p) => ({ ...p, engineSize: e.target.value }))} placeholder="2.5L" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Condition</Label>
          <Select value={form.condition} onValueChange={(v) => setForm((p) => ({ ...p, condition: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="used">Used</SelectItem><SelectItem value="certified">Certified Pre-Owned</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="sold">Sold</SelectItem><SelectItem value="reserved">Reserved</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Transmission</Label>
          <Select value={form.transmission} onValueChange={(v) => setForm((p) => ({ ...p, transmission: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="automatic">Automatic</SelectItem><SelectItem value="manual">Manual</SelectItem><SelectItem value="cvt">CVT</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Fuel Type</Label>
          <Select value={form.fuelType} onValueChange={(v) => setForm((p) => ({ ...p, fuelType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Electric</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Body Type</Label>
          <Select value={form.bodyType} onValueChange={(v) => setForm((p) => ({ ...p, bodyType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["sedan","suv","hatchback","coupe","truck","van","convertible","wagon"].map((b) => <SelectItem key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase()+b.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-primary" />
          <Label htmlFor="featured">Featured listing</Label>
        </div>
      </div>
      <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></div>
      <div><Label>Features (comma separated)</Label><Input value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} placeholder="Sunroof, Leather Seats, Navigation" /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>
      <div><Label>VIN</Label><Input value={form.vin} onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))} placeholder="1HGBH41JXMN109186" /></div>
      <Button type="submit" className="w-full" disabled={createCar.isPending || updateCar.isPending}>
        {car ? "Update Car" : "Add Car"}
      </Button>
    </form>
  );
}

// ─── Part Form ────────────────────────────────────────────────────────────────
function PartForm({ part, onSuccess }: { part?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: part?.name ?? "",
    sku: part?.sku ?? "",
    category: part?.category ?? "other",
    brand: part?.brand ?? "",
    price: part?.price ?? "",
    stock: part?.stock ?? 0,
    lowStockThreshold: part?.lowStockThreshold ?? 5,
    compatibleMakes: part?.compatibleMakes ?? "",
    compatibleModels: part?.compatibleModels ?? "",
    description: part?.description ?? "",
    warranty: part?.warranty ?? "",
    featured: part?.featured ?? false,
    active: part?.active ?? true,
    imageUrl: "",
  });

  const utils = trpc.useUtils();
  const createPart = trpc.parts.create.useMutation({
    onSuccess: () => { toast.success("Part added!"); utils.parts.list.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updatePart = trpc.parts.update.useMutation({
    onSuccess: () => { toast.success("Part updated!"); utils.parts.list.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, sku: form.sku, category: form.category as any,
      brand: form.brand || undefined, price: String(form.price),
      stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold),
      compatibleMakes: form.compatibleMakes || undefined,
      compatibleModels: form.compatibleModels || undefined,
      description: form.description || undefined, warranty: form.warranty || undefined,
      featured: form.featured, active: form.active,
      images: form.imageUrl ? [{ url: form.imageUrl, isPrimary: true }] : undefined,
    };
    if (part) updatePart.mutate({ id: part.id, ...data });
    else createPart.mutate(data);
  };

  const CATEGORIES = ["engine","brakes","suspension","electrical","body","interior","exhaust","transmission","cooling","fuel","filters","lighting","tyres","accessories","other"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Label>Part Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Oil Filter" required /></div>
        <div><Label>SKU *</Label><Input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="OIL-FLT-001" required /></div>
        <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} placeholder="Bosch" /></div>
        <div><Label>Price *</Label><Input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="29.99" required /></div>
        <div><Label>Stock *</Label><Input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} required /></div>
        <div><Label>Low Stock Alert</Label><Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: Number(e.target.value) }))} /></div>
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Compatible Makes (JSON array e.g. ["Toyota","Honda"])</Label><Input value={form.compatibleMakes} onChange={(e) => setForm((p) => ({ ...p, compatibleMakes: e.target.value }))} placeholder='["Toyota","Honda"]' /></div>
      <div><Label>Compatible Models (JSON array)</Label><Input value={form.compatibleModels} onChange={(e) => setForm((p) => ({ ...p, compatibleModels: e.target.value }))} placeholder='["Camry","Civic"]' /></div>
      <div><Label>Warranty</Label><Input value={form.warranty} onChange={(e) => setForm((p) => ({ ...p, warranty: e.target.value }))} placeholder="1 Year" /></div>
      <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2"><input type="checkbox" id="pfeatured" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-primary" /><Label htmlFor="pfeatured">Featured</Label></div>
        <div className="flex items-center gap-2"><input type="checkbox" id="pactive" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-primary" /><Label htmlFor="pactive">Active</Label></div>
      </div>
      <Button type="submit" className="w-full" disabled={createPart.isPending || updatePart.isPending}>
        {part ? "Update Part" : "Add Part"}
      </Button>
    </form>
  );
}

// ─── Main Admin Component ──────────────────────────────────────────────────
export default function Admin() {
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [editingPart, setEditingPart] = useState<any>(null);

  const statsQuery = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const carsQuery = trpc.cars.list.useQuery({ limit: 100, status: "available" }, { enabled: activeTab === "cars" });
  const partsQuery = trpc.parts.list.useQuery({ limit: 100 }, { enabled: activeTab === "parts" });
  const ordersQuery = trpc.orders.adminList.useQuery({ limit: 100 }, { enabled: activeTab === "orders" });
  const usersQuery = trpc.admin.users.useQuery(undefined, { enabled: activeTab === "users" });

  const utils = trpc.useUtils();
  const deleteCar = trpc.cars.delete.useMutation({
    onSuccess: () => { toast.success("Car deleted"); utils.cars.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deletePart = trpc.parts.delete.useMutation({
    onSuccess: () => { toast.success("Part deleted"); utils.parts.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateOrderStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.orders.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive/50" />
          <h2 className="font-display text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-5">You don't have permission to access the admin dashboard.</p>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "cars", label: "Cars", icon: Car },
    { key: "parts", label: "Parts", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-foreground text-background py-10">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-background/50 mb-1">
            <span>Admin</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-background">Admin Dashboard</h1>
          <p className="text-background/60 mt-1">Manage your AutoMart platform</p>
        </div>
      </div>

      <div className="container py-6 flex-1">
        {/* Tab Nav */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            {statsQuery.isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: formatPrice(statsQuery.data?.totalRevenue ?? 0), icon: TrendingUp, color: "text-emerald-600" },
                  { label: "Total Orders", value: statsQuery.data?.totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-600" },
                  { label: "Pending Orders", value: statsQuery.data?.pendingOrders ?? 0, icon: AlertTriangle, color: "text-yellow-600" },
                  { label: "Total Users", value: statsQuery.data?.totalUsers ?? 0, icon: Users, color: "text-purple-600" },
                  { label: "Available Cars", value: statsQuery.data?.availableCars ?? 0, icon: Car, color: "text-primary" },
                  { label: "Total Cars", value: statsQuery.data?.totalCars ?? 0, icon: Car, color: "text-muted-foreground" },
                  { label: "Total Parts", value: statsQuery.data?.totalParts ?? 0, icon: Package, color: "text-indigo-600" },
                  { label: "Low Stock Parts", value: statsQuery.data?.lowStockParts ?? 0, icon: AlertTriangle, color: "text-red-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card-elegant p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-elegant p-5">
                <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => { setEditingCar(null); setCarDialogOpen(true); }} className="gap-2 justify-start" variant="outline">
                    <Plus className="w-4 h-4" /> Add Car
                  </Button>
                  <Button onClick={() => { setEditingPart(null); setPartDialogOpen(true); }} className="gap-2 justify-start" variant="outline">
                    <Plus className="w-4 h-4" /> Add Part
                  </Button>
                  <Button onClick={() => setActiveTab("orders")} className="gap-2 justify-start" variant="outline">
                    <ShoppingBag className="w-4 h-4" /> View Orders
                  </Button>
                  <Button onClick={() => setActiveTab("users")} className="gap-2 justify-start" variant="outline">
                    <Users className="w-4 h-4" /> View Users
                  </Button>
                </div>
              </div>
              <div className="card-elegant p-5">
                <h3 className="font-display font-semibold text-lg mb-4">Platform Health</h3>
                <div className="space-y-3">
                  {[
                    { label: "Cars Available", ok: (statsQuery.data?.availableCars ?? 0) > 0 },
                    { label: "Parts In Stock", ok: (statsQuery.data?.lowStockParts ?? 0) === 0 },
                    { label: "Pending Orders", ok: (statsQuery.data?.pendingOrders ?? 0) === 0, warn: true },
                  ].map(({ label, ok, warn }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      {ok ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className={`w-4 h-4 ${warn ? "text-yellow-500" : "text-red-500"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cars Management */}
        {activeTab === "cars" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Car Inventory</h2>
              <Dialog open={carDialogOpen} onOpenChange={setCarDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCar(null)} className="gap-2"><Plus className="w-4 h-4" /> Add Car</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle></DialogHeader>
                  <CarForm car={editingCar} onSuccess={() => setCarDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {carsQuery.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="card-elegant overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Vehicle", "Year", "Price", "Condition", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {carsQuery.data?.map((car) => (
                        <tr key={car.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{car.make} {car.model}</td>
                          <td className="px-4 py-3 text-muted-foreground">{car.year}</td>
                          <td className="px-4 py-3 font-semibold text-primary">{formatPrice(car.price)}</td>
                          <td className="px-4 py-3"><Badge className={`text-xs capitalize ${car.condition === "new" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{car.condition}</Badge></td>
                          <td className="px-4 py-3"><Badge className={`text-xs capitalize ${car.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>{car.status}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Dialog open={carDialogOpen && editingCar?.id === car.id} onOpenChange={(o) => { setCarDialogOpen(o); if (!o) setEditingCar(null); }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCar(car); setCarDialogOpen(true); }}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader><DialogTitle>Edit Car</DialogTitle></DialogHeader>
                                  {editingCar && <CarForm car={editingCar} onSuccess={() => { setCarDialogOpen(false); setEditingCar(null); }} />}
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this car?")) deleteCar.mutate({ id: car.id }); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {carsQuery.data?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No cars found. <button onClick={() => setCarDialogOpen(true)} className="text-primary hover:underline">Add one</button>.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parts Management */}
        {activeTab === "parts" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Parts Inventory</h2>
              <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPart(null)} className="gap-2"><Plus className="w-4 h-4" /> Add Part</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editingPart ? "Edit Part" : "Add New Part"}</DialogTitle></DialogHeader>
                  <PartForm part={editingPart} onSuccess={() => setPartDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {partsQuery.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="card-elegant overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Part Name", "SKU", "Category", "Price", "Stock", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {partsQuery.data?.map((part) => (
                        <tr key={part.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium max-w-48 truncate">{part.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{part.sku}</td>
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{part.category}</Badge></td>
                          <td className="px-4 py-3 font-semibold text-primary">{formatPrice(part.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${part.stock <= (part.lowStockThreshold ?? 5) ? "text-red-500" : "text-emerald-600"}`}>
                              {part.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Dialog open={partDialogOpen && editingPart?.id === part.id} onOpenChange={(o) => { setPartDialogOpen(o); if (!o) setEditingPart(null); }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingPart(part); setPartDialogOpen(true); }}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader><DialogTitle>Edit Part</DialogTitle></DialogHeader>
                                  {editingPart && <PartForm part={editingPart} onSuccess={() => { setPartDialogOpen(false); setEditingPart(null); }} />}
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this part?")) deletePart.mutate({ id: part.id }); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {partsQuery.data?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No parts found. <button onClick={() => setPartDialogOpen(true)} className="text-primary hover:underline">Add one</button>.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Management */}
        {activeTab === "orders" && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-5">All Orders</h2>
            {ordersQuery.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="card-elegant overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Order #", "Customer", "Date", "Total", "Status", "Update Status"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ordersQuery.data?.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-medium">{order.orderNumber}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-3 font-semibold text-primary">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3"><Badge className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`}>{order.status}</Badge></td>
                          <td className="px-4 py-3">
                            <Select
                              value={order.status}
                              onValueChange={(v) => updateOrderStatus.mutate({ id: order.id, status: v as any })}
                            >
                              <SelectTrigger className="h-7 text-xs w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ordersQuery.data?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No orders yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-5">All Users</h2>
            {usersQuery.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : (
              <div className="card-elegant overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Name", "Email", "Role", "Login Method", "Joined"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usersQuery.data?.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{u.name ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                          <td className="px-4 py-3"><Badge className={`text-xs ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{u.loginMethod ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
