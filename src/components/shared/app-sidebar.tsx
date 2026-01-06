'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserSettings } from '@/lib/types/database';

interface AppSidebarProps {
  user: User;
  settings: UserSettings | null;
}

export const navItems = [
  { href: '/today', label: 'Today', icon: '◉' },
  { href: '/vision', label: 'Vision', icon: '✦' },
  { href: '/inbox', label: 'Inbox', icon: '↳' },
  { href: '/goals', label: 'Goals', icon: '◎' },
  { href: '/projects', label: 'Projects', icon: '▢' },
  { href: '/habits', label: 'Habits', icon: '↻' },
  { href: '/review', label: 'Review', icon: '✓' },
];

export function AppSidebar({ user, settings }: AppSidebarProps) {
  const pathname = usePathname();
  
  const initials = user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || 'NS';

  return (
    <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/today" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            N
          </div>
          <span className="text-xl font-semibold tracking-tight">Northstar</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
      <div className="p-4 border-t border-sidebar-border">
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
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

