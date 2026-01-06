'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { MenuIcon } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navItems } from './app-sidebar';
import { UserSettings } from '@/lib/types/database';

interface MobileNavProps {
  user: User;
  settings: UserSettings | null;
}

export function MobileNav({ user, settings }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sheet when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const initials = user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || 'NS';

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
            <SheetHeader className="p-6 border-b border-sidebar-border">
              <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
                  N
                </div>
                <span className="text-xl font-semibold tracking-tight">Northstar</span>
              </SheetTitle>
            </SheetHeader>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-sidebar-foreground/60">
                        {settings?.timezone || 'UTC'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={() => setOpen(false)}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo in header */}
        <Link href="/today" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            N
          </div>
          <span className="font-semibold">Northstar</span>
        </Link>
      </header>
    </div>
  );
}

