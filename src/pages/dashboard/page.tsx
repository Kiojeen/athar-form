import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  ClipboardList,
  Download,
  GraduationCap,
  Shield,
  ShieldOff,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PortalsTab } from "./portals-tab";

// ── Excel export ──────────────────────────────────────────────────────────────

function exportOrdersToExcel(orders: any[]) {
  const rows = orders.map((o) => ({
    الاسم: o.user?.name ?? "—",
    "البريد الإلكتروني": o.user?.email ?? "—",
    الجوال: o.user?.phone ?? "—",
    "نوع الوشاح": o.scarfType,
    "الاسم على الوشاح": o.scarfName,
    "الكتابة على الظهر": o.backText ?? "",
    "صورة الظهر": o.backImageUrl ?? "",
    "كتابة القبعة (أعلى)": o.hatTextTop ?? "",
    "كتابة القبعة (جانب)": o.hatTextSide ?? "",
    "صورة القبعة": o.hatImageUrl ?? "",
    "قياس الروب": o.robeSize,
    "قياس الردن والطول": o.robeSleeveLengthNote ?? "",
    "الاسم على الشهادة": o.certificateName,
    ملاحظات: o.notes ?? "",
    "تاريخ الطلب": new Date(o.createdAt).toLocaleDateString("ar-IQ"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الطلبات");

  // RTL column widths
  ws["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 28 }));

  XLSX.writeFile(wb, `athar-orders-${Date.now()}.xlsx`);
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const users = useQuery(api.users.getAllUsers);
  const setAdmin = useMutation(api.users.setAdmin);

  if (!users) return <TableSkeleton cols={5} rows={6} />;

  return (
    <div className="border-border/60 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-right">المستخدم</TableHead>
            <TableHead className="text-right">البريد</TableHead>
            <TableHead className="text-right">الجوال</TableHead>
            <TableHead className="text-right">الصلاحية</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const initials = u.name
              ? u.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              : "؟";
            return (
              <TableRow key={u._id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarImage src={u.image ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{u.name ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {u.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {u.phone ?? "—"}
                </TableCell>
                <TableCell>
                  {u.isAdmin ? (
                    <Badge variant="default" className="gap-1 text-xs">
                      <Shield className="h-3 w-3" /> مدير
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      مستخدم
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 gap-1 text-xs"
                    onClick={() =>
                      setAdmin({
                        userId: u._id,
                        isAdmin: !u.isAdmin,
                      })
                    }
                  >
                    {u.isAdmin ? (
                      <>
                        <ShieldOff className="h-3 w-3" /> إلغاء الإدارة
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3" /> تعيين مديراً
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const orders = useQuery(api.orders.getAllOrdersAdmin);

  if (!orders) return <TableSkeleton cols={7} rows={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{orders.length} طلب</p>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-2 text-xs"
          onClick={() => exportOrdersToExcel(orders)}
          disabled={orders.length === 0}
        >
          <Download className="h-3.5 w-3.5" />
          تصدير Excel
        </Button>
      </div>

      <div className="border-border/60 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[140px] text-right">
                المستخدم
              </TableHead>
              <TableHead className="min-w-[120px] text-right">
                نوع الوشاح
              </TableHead>
              <TableHead className="min-w-[120px] text-right">
                الاسم على الوشاح
              </TableHead>
              <TableHead className="min-w-[100px] text-right">
                قياس الروب
              </TableHead>
              <TableHead className="min-w-[140px] text-right">
                الاسم على الشهادة
              </TableHead>
              <TableHead className="min-w-[80px] text-right">الصور</TableHead>
              <TableHead className="min-w-[100px] text-right">
                التاريخ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  لا توجد طلبات بعد
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{o.user?.name ?? "—"}</p>
                    <p className="text-muted-foreground text-xs">
                      {o.user?.phone ?? ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{o.scarfType}</TableCell>
                <TableCell className="text-sm">{o.scarfName}</TableCell>
                <TableCell className="text-sm">{o.robeSize}</TableCell>
                <TableCell className="text-sm">{o.certificateName}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {o.backImageUrl && (
                      <a
                        href={o.backImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs underline underline-offset-2"
                      >
                        ظهر
                      </a>
                    )}
                    {o.hatImageUrl && (
                      <a
                        href={o.hatImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs underline underline-offset-2"
                      >
                        قبعة
                      </a>
                    )}
                    {!o.backImageUrl && !o.hatImageUrl && (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(o.createdAt).toLocaleDateString("ar-IQ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div className="border-border/60 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <TableCell key={c}>
                  <div
                    className="bg-muted h-3 animate-pulse rounded"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  // Not an admin — show nothing (route guard should handle this too)
  if (currentUser && !currentUser.isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">
          غير مصرح لك بالوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة الإدارة</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          إدارة الحسابات والطلبات
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatsCard
          icon={Users}
          label="إجمالي المستخدمين"
          query={api.users.getAllUsers}
          field="length"
        />
        <StatsCard
          icon={ClipboardList}
          label="إجمالي الطلبات"
          query={api.orders.getAllOrdersAdmin}
          field="length"
        />
      </div>

      <Separator className="opacity-50" />

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-4">
          <TabsTrigger value="orders" className="gap-1.5 text-sm">
            <ClipboardList className="h-3.5 w-3.5" /> الطلبات
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5" /> الحسابات
          </TabsTrigger>
          <TabsTrigger value="portals" className="gap-1.5 text-sm">
            <GraduationCap className="h-3.5 w-3.5" /> البوابات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="portals">
          <PortalsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  query,
  field,
}: {
  icon: any;
  label: string;
  query: any;
  field: string;
}) {
  const data = useQuery(query);
  const value = data ? (data as any)[field] : null;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {value === null ? (
            <span className="text-muted-foreground text-lg">…</span>
          ) : (
            value
          )}
        </p>
      </CardContent>
    </Card>
  );
}
