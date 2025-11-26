"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { resetStore } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  const handleReset = async () => {
    try {
      await resetStore();
      toast({
        title: "تمت إعادة الضبط",
        description: "تم حذف جميع البيانات بنجاح.",
      });
      router.push("/onboarding");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة إعادة ضبط المتجر.",
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="الإعدادات"
        description="إدارة إعدادات متجرك والقيام بالإجراءات المتقدمة."
      />
      <div className="mt-8">
        <h3 className="text-lg font-medium">إعادة ضبط المصنع</h3>
        <p className="text-sm text-muted-foreground mt-1">
          سيؤدي هذا الإجراء إلى حذف جميع بياناتك بشكل دائم، بما في ذلك
          المنتجات والعملاء والمعاملات. لا يمكن التراجع عن هذا الإجراء.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              إعادة ضبط المصنع
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف جميع البيانات نهائيًا. يشمل ذلك المنتجات، العملاء،
                المبيعات، وكل السجلات الأخرى. لا يمكنك التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                نعم، قم بإعادة الضبط
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
