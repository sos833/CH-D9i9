import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { mockRecentSales } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function RecentSales() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <div className="space-y-8">
      {mockRecentSales.map((sale, index) => (
        <div className="flex items-center" key={index}>
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={`https://picsum.photos/seed/${index+20}/40/40`} alt="Avatar" data-ai-hint="person portrait" />}
            <AvatarFallback>{sale.customerInitials}</AvatarFallback>
          </Avatar>
          <div className="mr-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {sale.email}
            </p>
          </div>
          <div className="mr-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}
