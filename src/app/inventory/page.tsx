import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockProducts } from "@/lib/data";
import { columns } from "./components/columns";

export default function InventoryPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="المخزون" description="إدارة المنتجات والأسعار والمخزون." />
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                إضافة منتج
              </span>
            </Button>
          </div>
      </div>
      <DataTable 
        columns={columns} 
        data={mockProducts}
        filterColumnId="name"
        filterPlaceholder="تصفية المنتجات..."
      />
    </AppLayout>
  );
}
