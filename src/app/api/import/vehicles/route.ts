import { NextRequest, NextResponse } from 'next/server';
import { createVehicle } from '@/lib/models/vehicle';
import { getTokenData } from '@/lib/auth/utils';
import * as ExcelJS from 'exceljs';

// Tip tanımları
interface VehicleImportData {
  PlateNumber: string;
  Route: string;
  DriverName: string;
  DriverPhone: string;
  Capacity: number;
  Occupancy: number;
}

export async function POST(req: NextRequest) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    // Admin kontrolü
    if (!tokenData.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    // Dosya yükleme kontrolü
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Excel dosyası zorunludur' },
        { status: 400 }
      );
    }
    
    // Excel dosyası işleme
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      return NextResponse.json(
        { error: 'Excel dosyasında veri bulunamadı' },
        { status: 400 }
      );
    }
    
    const vehiclesToAdd: VehicleImportData[] = [];
    const errors: string[] = [];
    let rowIndex = 0;
    
    // İlk satırı başlık olarak kabul edip atlıyoruz
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      rowIndex = rowNumber;
      
      // Başlık satırını atla
      if (rowNumber === 1) return;
      
      try {
        // Excel'den veriyi oku
        // Sütun indexleri 1'den başlar
        const vehicleData: VehicleImportData = {
          PlateNumber: row.getCell(1).value?.toString() || '',
          Route: row.getCell(2).value?.toString() || '',
          DriverName: row.getCell(3).value?.toString() || '',
          DriverPhone: row.getCell(4).value?.toString() || '',
          Capacity: parseInt(row.getCell(5).value?.toString() || '0'),
          Occupancy: parseInt(row.getCell(6).value?.toString() || '0')
        };
        
        // Temel doğrulama
        if (!vehicleData.PlateNumber) {
          errors.push(`Satır ${rowNumber}: Plaka numarası zorunludur`);
          return;
        }
        
        vehiclesToAdd.push(vehicleData);
      } catch (error) {
        errors.push(`Satır ${rowNumber}: İşlenirken hata oluştu`);
      }
    });
    
    if (vehiclesToAdd.length === 0) {
      return NextResponse.json(
        { 
          error: 'Eklenecek araç bulunamadı', 
          errors,
          totalRows: rowIndex - 1 // Başlık satırını çıkar
        },
        { status: 400 }
      );
    }
    
    // Araçları veritabanına ekle
    const addedVehicles = [];
    for (const vehicleData of vehiclesToAdd) {
      try {
        const vehicle = await createVehicle(vehicleData);
        if (vehicle) {
          addedVehicles.push(vehicle);
        }
      } catch (error: any) {
        console.error('Error adding vehicle:', error);
        
        // Duplicate key hatası
        if (error.code === '23505') {
          errors.push(`Araç "${vehicleData.PlateNumber}" zaten mevcut`);
        } else {
          errors.push(`Araç "${vehicleData.PlateNumber}" eklenirken hata oluştu`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${addedVehicles.length} araç başarıyla eklendi`,
      totalProcessed: vehiclesToAdd.length,
      totalAdded: addedVehicles.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing vehicles:', error);
    return NextResponse.json(
      { error: 'Araç içe aktarma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}