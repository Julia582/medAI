'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, Menu, X, Stethoscope, FileText, MessageSquare, LayoutDashboard, User } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-medical-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MedAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                <NavLink href="/documents" icon={<FileText className="h-4 w-4" />} label="Documents" />
                <NavLink href="/chat" icon={<MessageSquare className="h-4 w-4" />} label="AI Chat" />
                <NavLink href="/profile" icon={<User className="h-4 w-4" />} label="Profile" />
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          {isAuthenticated ? (
            <>
              <MobileNavLink href="/dashboard" label="Dashboard" />
              <MobileNavLink href="/documents" label="Documents" />
              <MobileNavLink href="/chat" label="AI Chat" />
              <MobileNavLink href="/profile" label="Profile" />
              <Button variant="ghost" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block"><Button variant="outline" className="w-full">Login</Button></Link>
              <Link href="/auth/register" className="block"><Button className="w-full">Get Started</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 transition-colors">
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
      {label}
    </Link>
  );
}
