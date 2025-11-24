
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
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

type ColumnsProps = {
  onViewDetails: (transaction: Transaction) => void;
};

const getPaymentMethodLabel = (method: 'cash' | 'credit', items: Transaction['items']) => {
    if (items.some(item => item.productId === 'DEBT_PAYMENT')) {
        return 'دفعة دين';
    }
    if (method === 'credit') {
        return 'دين';
    }
    return 'نقدي';
};

const getPaymentMethodVariant = (method: 'cash' | 'credit', items: Transaction['items']) => {
    if (items.some(item => item.productId === 'DEBT_PAYMENT')) {
        return 'default'; // Or another color like 'success' if you define it
    }
    if (method === 'credit') {
        return 'destructive';
    }
    return 'secondary';
}


export const columns = ({ onViewDetails }: ColumnsProps): ColumnDef<Transaction>[] => [
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
    accessorKey: "customerName",
    header: "العميل",
    cell: ({ row }) => {
        const transaction = row.original;
        if (transaction.items.some(item => item.productId === 'DEBT_PAYMENT')) {
            return <span>{transaction.customerName}</span>;
        }
        return <span>{row.getValue("customerName") || "بيع نقدي"}</span>
    }
  },
  {
    accessorKey: "total",
    header: "المبلغ الإجمالي",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("ar-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "نوع المعاملة",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <Badge variant={getPaymentMethodVariant(transaction.paymentMethod, transaction.items)}>
          {getPaymentMethodLabel(transaction.paymentMethod, transaction.items)}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original

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
            <DropdownMenuItem onClick={() => onViewDetails(transaction)}>عرض التفاصيل</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

    