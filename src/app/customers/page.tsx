import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockCustomers } from "@/lib/data";
import { columns } from "./components/columns";

export default function CustomersPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="العملاء" description="إدارة العملاء وتتبع ديونهم." />
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                إضافة عميل
              </span>
            </Button>
          </div>
      </div>
      <DataTable 
        columns={columns} 
        data={mockCustomers}
        filterColumnId="name"
        filterPlaceholder="تصفية العملاء..."
      />
    </AppLayout>
  );
}
