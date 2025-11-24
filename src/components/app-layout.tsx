
"use client";

import Link from 'next/link';
import * as React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  PanelLeft,
  Search,
  Receipt,
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
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'لوحة المعلومات' },
  { href: '/pos', icon: <ShoppingCart />, label: 'نقطة البيع' },
  { href: '/transactions', icon: <Receipt />, label: 'المعاملات' },
  { href: '/inventory', icon: <Package />, label: 'المخزون' },
  { href: '/customers', icon: <Users />, label: 'العملاء' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { storeSettings } = useApp();

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
              <span className="">{storeSettings.storeName || 'دفتر دي زاد'}</span>
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
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="lg:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xs bg-sidebar text-sidebar-foreground p-0">
                <SidebarHeader className="h-14">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      <Logo className="h-6 w-6 text-sidebar-primary" />
                      <span className="">{storeSettings.storeName || 'دفتر دي زاد'}</span>
                    </Link>
                  </SidebarHeader>
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
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
          </header>
          <main className="flex flex-1 flex-col p-4 sm:px-6 sm:py-4">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
