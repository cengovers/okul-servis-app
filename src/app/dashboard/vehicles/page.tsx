'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Search, Edit, Trash, Filter, Download, Upload,
  Eye, MoreHorizontal, ChevronLeft, ChevronRight, RefreshCw,
  Users, MapPin, Calendar, AlertTriangle
} from 'lucide-react';

// Servis tipi tanımlaması
interface Vehicle {
  VehicleID: number;
  PlateNumber: string;
  Route: string;
  DriverName: string;
  DriverPhone: string;
  Capacity: number;
  Occupancy: number;
  Status: 'active' | 'maintenance' | 'inactive';
  LastService: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDropdown, setActionDropdown] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const router = useRouter();

  useEffect(() => {
    // Demo veriler - gerçekte API'den gelecek
    setTimeout(() => {
      const demoVehicles: Vehicle[] = [
        { 
          VehicleID: 1, 
          PlateNumber: '34 ABC 123', 
          Route: 'Kadıköy - Üsküdar', 
          DriverName: 'Ahmet Yılmaz',
          DriverPhone: '0532 123 4567',
          Capacity: 20,
          Occupancy: 18,
          Status: 'active',
          LastService: '2025-03-15'
        },
        { 
          VehicleID: 2, 
          PlateNumber: '34 XYZ 789', 
          Route: 'Beşiktaş - Şişli', 
          DriverName: 'Mehmet Demir',
          DriverPhone: '0533 234 5678',
          Capacity: 18,
          Occupancy: 15,
          Status: 'active',
          LastService: '2025-04-01'
        },
        { 
          VehicleID: 3, 
          PlateNumber: '34 DEF 456', 
          Route: 'Beylikdüzü - Avcılar', 
          DriverName: 'Ali Kaya',
          DriverPhone: '0534 345 6789',
          Capacity: 16,
          Occupancy: 12,
          Status: 'maintenance',
          LastService: '2025-02-20'
        },
        { 
          VehicleID: 4, 
          PlateNumber: '34 LMN 321', 
          Route: 'Bahçelievler - Bakırköy', 
          DriverName: 'Hasan Şahin',
          DriverPhone: '0535 456 7890',
          Capacity: 22,
          Occupancy: 20,
          Status: 'active',
          LastService: '2025-03-25'
        },
        { 
          VehicleID: 5, 
          PlateNumber: '34 PQR 654', 
          Route: 'Ataşehir - Ümraniye', 
          DriverName: 'Osman Yıldız',
          DriverPhone: '0536 567 8901',
          Capacity: 16,
          Occupancy: 0,
          Status: 'inactive',
          LastService: '2025-01-10'
        },
        { 
          VehicleID: 6, 
          PlateNumber: '34 STU 987', 
          Route: 'Sarıyer - Eyüp', 
          DriverName: 'Murat Aydın',
          DriverPhone: '0537 678 9012',
          Capacity: 20,
          Occupancy: 18,
          Status: 'active',
          LastService: '2025-03-05'
        }
      ];
      
      setVehicles(demoVehicles);
      setLoading(false);
    }, 1000);
    
    // Gerçek implementasyon:
    // fetchVehicles();
  }, []);

  // Filtre ve arama işlemleri
  const filteredVehicles = vehicles.filter(vehicle => {
    // Arama filtreleme
    const matchesSearch = 
      vehicle.PlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.Route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.DriverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Kategori filtreleme
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && vehicle.Status === 'active';
    if (selectedFilter === 'maintenance') return matchesSearch && vehicle.Status === 'maintenance';
    if (selectedFilter === 'inactive') return matchesSearch && vehicle.Status === 'inactive';
    
    return matchesSearch;
  });

  // Doluluk oranını hesaplama
  const calculateOccupancyPercentage = (occupancy: number, capacity: number) => {
    return Math.round((occupancy / capacity) * 100);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Servisler</h1>
          <p className="text-gray-600 mt-1">Servis araçlarını yönetin ve görüntüleyin</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-2"
            onClick={() => {/* Excel indirme fonksiyonu */}}
          >
            <Download size={18} />
            <span>Excel</span>
          </button>
          <button 
            className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-2"
            onClick={() => {/* Excel yükleme fonksiyonu */}}
          >
            <Upload size={18} />
            <span>İçe Aktar</span>
          </button>
          <button 
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            onClick={() => router.push('/dashboard/vehicles/new')}
          >
            <Plus size={18} />
            <span>Yeni Servis</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Arama ve filtreleme bölümü */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="Plaka, güzergah veya sürücü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex space-x-1">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tümü
              </button>
              <button 
                onClick={() => setSelectedFilter('active')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFilter === 'active' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Aktif
              </button>
              <button 
                onClick={() => setSelectedFilter('maintenance')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFilter === 'maintenance' 
                    ? 'bg-yellow-50 text-yellow-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Bakımda
              </button>
              <button 
                onClick={() => setSelectedFilter('inactive')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFilter === 'inactive' 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pasif
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredVehicles.length} servis bulundu
            </div>
          </div>
        </div>
        
        {/* Servis kartları */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Servis bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uyan servis kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(vehicle => {
              const occupancyPercentage = calculateOccupancyPercentage(vehicle.Occupancy, vehicle.Capacity);
              return (
                <div 
                  key={vehicle.VehicleID} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="relative">
                    {/* Status Indicator */}
                    <div className={`absolute top-0 right-0 m-4 px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.Status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : vehicle.Status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.Status === 'active' 
                        ? 'Aktif' 
                        : vehicle.Status === 'maintenance'
                          ? 'Bakımda'
                          : 'Pasif'}
                    </div>
                    
                    <div className="h-3 bg-gray-200">
                      <div 
                        className={`h-3 ${
                          occupancyPercentage >= 90 
                            ? 'bg-red-500' 
                            : occupancyPercentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${occupancyPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.PlateNumber}</h3>
                          <p className="text-gray-600">{vehicle.Route}</p>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => setActionDropdown(actionDropdown === vehicle.VehicleID ? null : vehicle.VehicleID)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          
                          {actionDropdown === vehicle.VehicleID && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => router.push(`/dashboard/vehicles/${vehicle.VehicleID}`)}
                                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye size={16} className="mr-2" />
                                  Detayları Görüntüle
                                </button>
                                <button
                                  onClick={() => router.push(`/dashboard/vehicles/${vehicle.VehicleID}/edit`)}
                                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit size={16} className="mr-2" />
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => {/* Silme fonksiyonu */}}
                                  className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <Trash size={16} className="mr-2" />
                                  Sil
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Kapasite</p>
                            <p className="text-sm text-gray-500">
                              {vehicle.Occupancy} / {vehicle.Capacity} ({occupancyPercentage}%)
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Sürücü</p>
                            <p className="text-sm text-gray-500">{vehicle.DriverName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Son Bakım</p>
                            <p className="text-sm text-gray-500">
                              {new Date(vehicle.LastService).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        {vehicle.Status === 'active' && (
                          <Link 
                            href={`/dashboard/vehicles/${vehicle.VehicleID}/students`}
                            className="flex-1 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md text-sm text-center"
                          >
                            Öğrencileri Gör
                          </Link>
                        )}
                        {vehicle.Status === 'maintenance' && (
                          <button 
                            className="flex-1 py-2 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium rounded-md text-sm text-center flex items-center justify-center"
                          >
                            <RefreshCw size={16} className="mr-2" />
                            Durumu Güncelle
                          </button>
                        )}
                        {vehicle.Status === 'inactive' && (
                          <button 
                            className="flex-1 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md text-sm text-center"
                          >
                            Aktifleştir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}