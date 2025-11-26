"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/lib/types"
import { CustomCheckbox } from "@/components/ui/custom-checkbox"

type ColumnsProps = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] => [
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
    accessorKey: "stock",
    header: "المخزون",
  },
  {
    accessorKey: "costPrice",
    header: "سعر التكلفة",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("costPrice"))
      const formatted = new Intl.NumberFormat("ar-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "سعر البيع",
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sellingPrice"))
      const formatted = new Intl.NumberFormat("ar-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

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
            <DropdownMenuItem onClick={() => onEdit(product)}>تعديل المنتج</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(product)} 
              className="text-destructive focus:text-destructive"
            >
              حذف المنتج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
