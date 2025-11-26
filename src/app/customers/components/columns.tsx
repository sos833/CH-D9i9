"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Copy, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Customer } from "@/lib/types"
import { CustomCheckbox } from "@/components/ui/custom-checkbox"
import { useToast } from "@/hooks/use-toast"

const PhoneCell = ({ phone }: { phone: string }) => {
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(phone);
        toast({ title: "تم النسخ", description: "تم نسخ رقم الهاتف إلى الحافظة." });
    };

    return (
        <div className="flex items-center gap-2">
            <a href={`tel:${phone}`} className="flex items-center gap-1 hover:underline">
                <Phone className="h-4 w-4" />
                {phone}
            </a>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">نسخ الرقم</span>
            </Button>
        </div>
    );
};


type ColumnsProps = {
  onAddPayment: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
};

export const columns = ({ onAddPayment, onEdit, onViewDetails }: ColumnsProps): ColumnDef<Customer>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <CustomCheckbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onChange={(e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            table.toggleAllPageRowsSelected(!!isChecked)
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
       <CustomCheckbox
        checked={row.getIsSelected()}
        onChange={(e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            row.toggleSelected(!!isChecked);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          الاسم
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "الهاتف",
    cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return <PhoneCell phone={phone} />;
    }
  },
  {
    accessorKey: "totalDebt",
    header: "إجمالي الدين",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalDebt"))
      const formatted = new Intl.NumberFormat("ar-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(amount)

      const isDebt = amount > 0

      return <div className={`font-medium ${isDebt ? 'text-destructive' : ''}`}>{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAddPayment(customer)}>إضافة دفعة</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(customer)}>عرض التفاصيل</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(customer)}>تعديل العميل</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
