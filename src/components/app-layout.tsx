
"use client";

import Link from 'next/link';
import * as React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  PanelLeft,
  Receipt,
  Wallet,
  LineChart,
  Calculator,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader as SheetHeaderPrimitive, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'لوحة المعلومات' },
  { href: '/pos', icon: <ShoppingCart />, label: 'نقطة البيع' },
  { href: '/transactions', icon: <Receipt />, label: 'المعاملات' },
  { href: '/inventory', icon: <Package />, label: 'المخزون' },
  { href: '/customers', icon: <Users />, label: 'العملاء' },
  { href: '/cashbox', icon: <Wallet />, label: 'الصندوق' },
  { href: '/analytics', icon: <LineChart />, label: 'التحاليل' },
  { href: '/calculator', icon: <Calculator />, label: 'آلة حاسبة' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { storeSettings } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar
          side="right"
          className="hidden border-l bg-sidebar text-sidebar-foreground lg:block"
          collapsible="icon"
        >
          <SidebarHeader className="h-14">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-sidebar-primary" />
              <span className="">{isLoading ? 'دفتر دي زاد' : storeSettings?.storeName || 'دفتر دي زاد'}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'left' }}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="lg:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xs bg-sidebar text-sidebar-foreground p-0">
                 <SheetHeaderPrimitive className="flex flex-row items-center justify-between h-14 px-4 border-b border-sidebar-border">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      <Logo className="h-6 w-6 text-sidebar-primary" />
                      <span className="">{isLoading ? 'دفتر دي زاد' : storeSettings?.storeName || 'دفتر دي زاد'}</span>
                    </Link>
                 </SheetHeaderPrimitive>
                <nav className="grid gap-6 text-lg font-medium p-6">
                {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-4 px-2.5',
                        pathname === item.href ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:text-sidebar-accent-foreground',
                      )}
                    >
                      {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
