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
import type { Supplier } from "@/lib/types"

type ColumnsProps = {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Supplier>[] => [
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
    accessorKey: "company",
    header: "الشركة",
  },
  {
    accessorKey: "phone",
    header: "الهاتف",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const supplier = row.original

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
            <DropdownMenuItem onClick={() => onEdit(supplier)}>تعديل المورد</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(supplier)} 
              className="text-destructive focus:text-destructive"
            >
              حذف المورد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
