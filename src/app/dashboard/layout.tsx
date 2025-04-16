'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, School, Bus, CreditCard, LogOut, Menu, X, Bell, User, Search, ChevronDown
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigationItems = [
    { name: 'Ana Sayfa', href: '/dashboard', icon: Home },
    { name: 'Öğrenciler', href: '/dashboard/students', icon: Users },
    { name: 'Servisler', href: '/dashboard/vehicles', icon: Bus },
    { name: 'Ödemeler', href: '/dashboard/payments', icon: CreditCard },
  ];

  if (user?.isAdmin) {
    navigationItems.push({ name: 'Okullar', href: '/dashboard/schools', icon: School });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E8BC0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-[#1D2D44] focus:outline-none lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-[#2E8BC0]">
              Ela Taşımacılık
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-8 h-8 rounded-full bg-[#2E8BC0] text-white flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50">
                  <div className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{user?.name || 'Kullanıcı'}</div>
                    <div className="text-gray-500">{user?.username || 'kullanici'}</div>
                  </div>
                  <ul>
                    <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a></li>
                    <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayarlar</a></li>
                    <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Çıkış Yap</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 bg-white border-r border-gray-200 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="h-full px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-[#E6F4FA] text-[#2E8BC0]' : 'text-gray-700 hover:bg-gray-100'}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#2E8BC0]' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
          <hr className="my-4 border-t border-gray-200" />
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* Ana içerik */}
      <main className="lg:ml-64 pt-20 px-4 pb-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
          {children}
        </div>
      </main>
    </div>
  );
}