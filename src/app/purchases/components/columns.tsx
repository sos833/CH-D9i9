"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Purchase } from "@/lib/types"

type ColumnsProps = {
  onViewDetails: (purchase: Purchase) => void;
};

export const columns = ({ onViewDetails }: ColumnsProps): ColumnDef<Purchase>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          التاريخ
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return <span>{date.toLocaleDateString('ar-DZ')} {date.toLocaleTimeString('ar-DZ')}</span>
    },
  },
  {
    accessorKey: "supplierName",
    header: "المورد",
  },
  {
    accessorKey: "totalCost",
    header: "التكلفة الإجمالية",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalCost"))
      const formatted = new Intl.NumberFormat("ar-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "items",
    header: "عدد الأصناف",
    cell: ({ row }) => {
      const items = row.getValue("items") as any[];
      return <span>{items.length}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const purchase = row.original

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
            <DropdownMenuItem onClick={() => onViewDetails(purchase)}>عرض التفاصيل</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
