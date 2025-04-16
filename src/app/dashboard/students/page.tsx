'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Search, Edit, Trash, ChevronDown, Filter, Download, Upload,
  Eye, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';

// Öğrenci tipi tanımlaması
interface Student {
  StudentID: number;
  StudentName: string;
  Classroom: number;
  School: string;
  Vehicle: string;
  ParentName: string;
  ParentPhone: string;
  PaymentStatus: 'paid' | 'pending' | 'overdue';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(8);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionDropdown, setActionDropdown] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Demo veriler - gerçekte API'den gelecek
    setTimeout(() => {
      const demoStudents: Student[] = [
        { 
          StudentID: 1, 
          StudentName: 'Ali Yılmaz', 
          Classroom: 3, 
          School: 'Atatürk İlkokulu',
          Vehicle: '34 ABC 123',
          ParentName: 'Mehmet Yılmaz',
          ParentPhone: '0532 123 4567',
          PaymentStatus: 'paid'
        },
        { 
          StudentID: 2, 
          StudentName: 'Ayşe Demir', 
          Classroom: 5, 
          School: 'Atatürk İlkokulu',
          Vehicle: '34 ABC 124',
          ParentName: 'Fatma Demir',
          ParentPhone: '0533 234 5678',
          PaymentStatus: 'pending'
        },
        { 
          StudentID: 3, 
          StudentName: 'Mehmet Kaya', 
          Classroom: 2, 
          School: 'Cumhuriyet İlkokulu',
          Vehicle: '34 XYZ 789',
          ParentName: 'Ahmet Kaya',
          ParentPhone: '0534 345 6789',
          PaymentStatus: 'paid'
        },
        { 
          StudentID: 4, 
          StudentName: 'Zeynep Şahin', 
          Classroom: 4, 
          School: 'Cumhuriyet İlkokulu',
          Vehicle: '34 XYZ 789',
          ParentName: 'Mustafa Şahin',
          ParentPhone: '0535 456 7890',
          PaymentStatus: 'overdue'
        },
        { 
          StudentID: 5, 
          StudentName: 'Cem Yıldız', 
          Classroom: 1, 
          School: 'Gazi İlkokulu',
          Vehicle: '34 DEF 456',
          ParentName: 'Selim Yıldız',
          ParentPhone: '0536 567 8901',
          PaymentStatus: 'paid'
        },
        { 
          StudentID: 6, 
          StudentName: 'Deniz Aydın', 
          Classroom: 6, 
          School: 'Gazi İlkokulu',
          Vehicle: '34 DEF 456',
          ParentName: 'Hakan Aydın',
          ParentPhone: '0537 678 9012',
          PaymentStatus: 'pending'
        },
        { 
          StudentID: 7, 
          StudentName: 'Ece Çelik', 
          Classroom: 3, 
          School: 'Atatürk İlkokulu',
          Vehicle: '34 ABC 123',
          ParentName: 'Serkan Çelik',
          ParentPhone: '0538 789 0123',
          PaymentStatus: 'paid'
        },
        { 
          StudentID: 8, 
          StudentName: 'Burak Öztürk', 
          Classroom: 2, 
          School: 'Cumhuriyet İlkokulu',
          Vehicle: '34 XYZ 789',
          ParentName: 'Murat Öztürk',
          ParentPhone: '0539 890 1234',
          PaymentStatus: 'overdue'
        },
        { 
          StudentID: 9, 
          StudentName: 'Selin Koç', 
          Classroom: 5, 
          School: 'Gazi İlkokulu',
          Vehicle: '34 DEF 456',
          ParentName: 'Emre Koç',
          ParentPhone: '0540 901 2345',
          PaymentStatus: 'paid'
        },
        { 
          StudentID: 10, 
          StudentName: 'Kaan Aksoy', 
          Classroom: 4, 
          School: 'Atatürk İlkokulu',
          Vehicle: '34 ABC 124',
          ParentName: 'Burak Aksoy',
          ParentPhone: '0541 012 3456',
          PaymentStatus: 'pending'
        }
      ];
      
      setStudents(demoStudents);
      setTotalStudents(demoStudents.length);
      setLoading(false);
    }, 1000);
    
    // Gerçek implementasyon:
    // fetchStudents();
  }, []);

  // Filtre ve arama işlemleri
  const filteredStudents = students.filter(student => {
    // Arama filtreleme
    const matchesSearch = 
      student.StudentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.School.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.Vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ParentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Kategori filtreleme
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'paid') return matchesSearch && student.PaymentStatus === 'paid';
    if (selectedFilter === 'pending') return matchesSearch && student.PaymentStatus === 'pending';
    if (selectedFilter === 'overdue') return matchesSearch && student.PaymentStatus === 'overdue';
    
    return matchesSearch;
  });
  
  // Sayfalama
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Sayfa değiştirme
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Öğrenciler</h1>
          <p className="text-gray-600 mt-1">Tüm öğrencileri yönetin ve görüntüleyin</p>
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
            onClick={() => router.push('/dashboard/students/new')}
          >
            <Plus size={18} />
            <span>Yeni Öğrenci</span>
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
              placeholder="Öğrenci ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                <Filter size={16} className="text-gray-500" />
                <span>Ödeme Durumu</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedFilter('all');
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full px-4 py-2 text-sm ${
                        selectedFilter === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tümü
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFilter('paid');
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full px-4 py-2 text-sm ${
                        selectedFilter === 'paid' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Ödendi
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFilter('pending');
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full px-4 py-2 text-sm ${
                        selectedFilter === 'pending' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Bekliyor
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFilter('overdue');
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full px-4 py-2 text-sm ${
                        selectedFilter === 'overdue' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Gecikmiş
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredStudents.length} öğrenci bulundu
            </div>
          </div>
        </div>
        
        {/* Öğrenci tablosu */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Öğrenci bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uyan öğrenci kaydı bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sınıf/Okul
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veli
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servis
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Durumu
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <tr key={student.StudentID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.StudentName}</div>
                        <div className="text-sm text-gray-500">#{student.StudentID}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.Classroom}. Sınıf</div>
                        <div className="text-sm text-gray-500">{student.School}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.ParentName}</div>
                        <div className="text-sm text-gray-500">{student.ParentPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.Vehicle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.PaymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : student.PaymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {student.PaymentStatus === 'paid' 
                            ? 'Ödendi' 
                            : student.PaymentStatus === 'pending'
                              ? 'Bekliyor'
                              : 'Gecikti'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button 
                            onClick={() => setActionDropdown(actionDropdown === student.StudentID ? null : student.StudentID)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          
                          {actionDropdown === student.StudentID && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => router.push(`/dashboard/students/${student.StudentID}`)}
                                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye size={16} className="mr-2" />
                                  Detayları Görüntüle
                                </button>
                                <button
                                  onClick={() => router.push(`/dashboard/students/${student.StudentID}/edit`)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Sayfalama */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{(currentPage - 1) * studentsPerPage + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(currentPage * studentsPerPage, filteredStudents.length)}
                </span>
                {' '}/ {filteredStudents.length} öğrenci
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  // Hesapla: gösterilecek sayfa numaraları
                  let pageNum;
                  if (totalPages <= 3) {
                    // 3 veya daha az sayfa varsa hepsini göster
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    // Başlangıçta ilk 3 sayfayı göster
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    // Sonda son 3 sayfayı göster
                    pageNum = totalPages - 2 + i;
                  } else {
                    // Ortada, mevcut sayfanın etrafındaki sayfaları göster
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(pageNum)}
                      className={`w-9 h-9 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}