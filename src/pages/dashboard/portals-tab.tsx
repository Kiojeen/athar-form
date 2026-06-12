/**
 * Drop this tab into AdminPage.tsx inside the <Tabs> component.
 * Also add to TabsList:
 *   <TabsTrigger value="portals"><GraduationCap className="w-3.5 h-3.5" /> البوابات</TabsTrigger>
 * And TabsContent:
 *   <TabsContent value="portals"><PortalsTab /></TabsContent>
 */
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Copy,
  GraduationCap,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BASE_URL = window.location.origin;

export function PortalsTab() {
  const universities = useQuery(api.universities.getAllUniversities);
  const createUni = useMutation(api.universities.createUniversity);
  const deleteUni = useMutation(api.universities.deleteUniversity);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createUni({ name: trimmed });
      setName("");
      toast("تم إنشاء البوابة ✓");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/login/${id}`);
    toast("تم نسخ الرابط");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Input
          dir="rtl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الجامعة أو الكلية"
          className="h-9 max-w-xs text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button
          size="sm"
          className="h-9 gap-1.5 text-sm"
          onClick={handleCreate}
          disabled={creating || !name.trim()}
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          إنشاء بوابة
        </Button>
      </div>

      {/* Table */}
      <div className="border-border/60 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-right">الجامعة / الكلية</TableHead>
              <TableHead className="text-right">الطلاب</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">رابط البوابة</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!universities && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="text-muted-foreground mx-auto h-4 w-4 animate-spin" />
                </TableCell>
              </TableRow>
            )}
            {universities?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  لا توجد بوابات بعد — أنشئ أولى بوابتك أعلاه
                </TableCell>
              </TableRow>
            )}
            {universities?.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {u.studentCount} طالب
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(u.createdAt).toLocaleDateString("ar-IQ")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <code className="bg-muted text-muted-foreground block max-w-40 truncate rounded px-1.5 py-0.5 font-mono text-xs">
                      /login/{u._id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => copyLink(u._id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف البوابة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف بوابة «{u.name}» نهائياً. لن يتمكن الطلاب من
                          التسجيل عبرها بعد الآن، لكن حسابات الطلاب الحالية لن
                          تُحذف.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            deleteUni({ id: u._id as Id<"universities"> })
                          }
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
