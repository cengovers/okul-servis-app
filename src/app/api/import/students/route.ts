import { NextRequest, NextResponse } from 'next/server';
import { createStudent } from '@/lib/models/student';
import { findSchoolById } from '@/lib/models/school';
import { getTokenData } from '@/lib/auth/utils';
import * as ExcelJS from 'exceljs';

// Tip tanımları
interface StudentImportData {
  StudentName: string;
  Classroom: number;
  City: string;
  Town: string;
  Neighborhood: string;
  AddressText: string;
  ParentName1: string;
  ParentPhone1: string;
  ParentName2: string;
  ParentPhone2: string;
  StudentIDNumber: string;
  Parent1IDNumber: string;
  Parent2IDNumber: string;
  SchoolID: number;
  VehicleID: number | null;
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
    
    // Dosya yükleme kontrolü
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Excel dosyası zorunludur' },
        { status: 400 }
      );
    }
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'Okul ID zorunludur' },
        { status: 400 }
      );
    }
    
    // Okul ID doğrulama ve yetki kontrolü
    const school = await findSchoolById(parseInt(schoolId));
    
    if (!school) {
      return NextResponse.json(
        { error: 'Okul bulunamadı' },
        { status: 404 }
      );
    }
    
    // Yetki kontrolü: Admin veya okul sorumlusu
    if (!tokenData.isAdmin && school.UserID !== Number(tokenData.userId)) {
      return NextResponse.json(
        { error: 'Bu okula öğrenci ekleme yetkiniz yok' },
        { status: 403 }
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
    
    const studentsToAdd: StudentImportData[] = [];
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
        const studentData: StudentImportData = {
          StudentName: row.getCell(1).value?.toString() || '',
          Classroom: parseInt(row.getCell(2).value?.toString() || '0'),
          City: row.getCell(3).value?.toString() || '',
          Town: row.getCell(4).value?.toString() || '',
          Neighborhood: row.getCell(5).value?.toString() || '',
          AddressText: row.getCell(6).value?.toString() || '',
          ParentName1: row.getCell(7).value?.toString() || '',
          ParentPhone1: row.getCell(8).value?.toString() || '',
          ParentName2: row.getCell(9).value?.toString() || '',
          ParentPhone2: row.getCell(10).value?.toString() || '',
          StudentIDNumber: row.getCell(11).value?.toString() || '',
          Parent1IDNumber: row.getCell(12).value?.toString() || '',
          Parent2IDNumber: row.getCell(13).value?.toString() || '',
          SchoolID: parseInt(schoolId),
          VehicleID: null
        };
        
        // Temel doğrulama
        if (!studentData.StudentName) {
          errors.push(`Satır ${rowNumber}: Öğrenci adı zorunludur`);
          return;
        }
        
        studentsToAdd.push(studentData);
      } catch (error) {
        errors.push(`Satır ${rowNumber}: İşlenirken hata oluştu`);
      }
    });
    
    if (studentsToAdd.length === 0) {
      return NextResponse.json(
        { 
          error: 'Eklenecek öğrenci bulunamadı', 
          errors,
          totalRows: rowIndex - 1 // Başlık satırını çıkar
        },
        { status: 400 }
      );
    }
    
    // Öğrencileri veritabanına ekle
    const addedStudents = [];
    for (const studentData of studentsToAdd) {
      try {
        const student = await createStudent(studentData);
        if (student) {
          addedStudents.push(student);
        }
      } catch (error) {
        console.error('Error adding student:', error);
        errors.push(`Öğrenci "${studentData.StudentName}" eklenirken hata oluştu`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${addedStudents.length} öğrenci başarıyla eklendi`,
      totalProcessed: studentsToAdd.length,
      totalAdded: addedStudents.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      { error: 'Öğrenci içe aktarma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}