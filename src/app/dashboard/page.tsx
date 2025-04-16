'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Bus, CreditCard, School, TrendingUp, ArrowUp, ArrowDown, 
  Calendar, Bell, AlertTriangle, CheckCircle, List
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    studentCount: 0,
    vehicleCount: 0,
    schoolCount: 0,
    totalDuePayments: 0,
    unpaidInstallments: 0,
    lastMonthPayments: 0,
    paymentChange: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Demo amaçlı grafik verisi
  const paymentData = [
    { month: 'Ocak', amount: 15000 },
    { month: 'Şubat', amount: 18000 },
    { month: 'Mart', amount: 16500 },
    { month: 'Nisan', amount: 21000 },
    { month: 'Mayıs', amount: 19500 },
    { month: 'Haziran', amount: 22000 },
  ];
  
  useEffect(() => {
    // Kullanıcı bilgisini local storage'dan al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Demo amaçlı, gerçek veriler API'den gelecek
    setTimeout(() => {
      setStats({
        studentCount: 124,
        vehicleCount: 8,
        schoolCount: 3,
        totalDuePayments: 45000,
        unpaidInstallments: 12,
        lastMonthPayments: 22000,
        paymentChange: 6.8
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kontrol Paneli</h1>
        <p className="text-gray-600 mt-1">Hoş geldiniz, {user?.name || 'Kullanıcı'}. İşte bugün için genel bakış.</p>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Öğrenci Sayısı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Öğrenci Sayısı</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.studentCount}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 h-fit">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/dashboard/students"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Tüm öğrencileri görüntüle &rarr;
            </Link>
          </div>
        </div>
        
        {/* Servis Sayısı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Servis Sayısı</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.vehicleCount}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 h-fit">
              <Bus className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/dashboard/vehicles"
              className="text-sm font-medium text-green-600 hover:text-green-800"
            >
              Tüm servisleri görüntüle &rarr;
            </Link>
          </div>
        </div>
        
        {/* Ödeme Durumu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Aylık Ödeme</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₺{stats.lastMonthPayments.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 h-fit">
              <CreditCard className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              stats.paymentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats.paymentChange >= 0 ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(stats.paymentChange)}%
            </span>
            <span className="text-xs text-gray-500 ml-2">geçen aya göre</span>
          </div>
        </div>
        
        {/* Okul Sayısı (sadece admin için) */}
        {user?.isAdmin ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Okul Sayısı</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.schoolCount}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50 h-fit">
                <School className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/schools"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Tüm okulları görüntüle &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bekleyen Ödemeler</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₺{stats.totalDuePayments.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50 h-fit">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/payments"
                className="text-sm font-medium text-amber-600 hover:text-amber-800"
              >
                Ödeme detaylarını gör &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ödeme Grafiği */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Aylık Ödeme Analizi</h3>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Son 6 Ay
            </div>
          </div>
          
          {/* Basit Çubuk Grafik */}
          <div className="h-64 relative mt-4">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-56">
              {paymentData.map((item, index) => {
                // Maks değeri bul
                const maxValue = Math.max(...paymentData.map(d => d.amount));
                // Yüksekliği hesapla (maks yükseklik 200px)
                const height = (item.amount / maxValue) * 200;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-16 bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all cursor-pointer relative group"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white py-1 px-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        ₺{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{item.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Son Aktiviteler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Son Aktiviteler</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Tümünü Gör</a>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Yeni öğrenci kaydı</p>
                <p className="text-sm text-gray-500">Ali Yılmaz sisteme eklendi</p>
                <p className="text-xs text-gray-400 mt-1">10 dakika önce</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Gecikmiş ödeme</p>
                <p className="text-sm text-gray-500">3 öğrencinin ödemesi gecikti</p>
                <p className="text-xs text-gray-400 mt-1">1 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <Bus className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Yeni servis eklendi</p>
                <p className="text-sm text-gray-500">34 ABC 123 plakalı araç</p>
                <p className="text-xs text-gray-400 mt-1">3 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Ödeme alındı</p>
                <p className="text-sm text-gray-500">₺2,500 tutarında ödeme</p>
                <p className="text-xs text-gray-400 mt-1">Dün</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Öncelikli Öğeler (To-Do) */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Yapılacaklar</h3>
          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {stats.unpaidInstallments} öğe
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="text-sm text-gray-700">Bu ayın ödeme tahsilatları</span>
            </div>
            <div className="text-xs font-medium bg-white rounded-full px-3 py-1 text-yellow-700 border border-yellow-200">
              25 Nisan
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-sm text-gray-700">Geciken ödemeleri hatırlat</span>
            </div>
            <div className="text-xs font-medium bg-white rounded-full px-3 py-1 text-red-700 border border-red-200">
              Önceliklbn
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center">
              <List className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">Servis güzergahlarını güncelle</span>
            </div>
            <div className="text-xs font-medium bg-white rounded-full px-3 py-1 text-blue-700 border border-blue-200">
              Bu hafta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}