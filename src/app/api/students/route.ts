import { NextRequest, NextResponse } from 'next/server';
import { createStudent, getAllStudents, getStudentsBySchool } from '@/lib/models/student';
import { getTokenData } from '@/lib/auth/utils';

export async function GET(req: NextRequest) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const schoolId = url.searchParams.get('schoolId');
    
    let students;
    
    // Okula göre öğrencileri filtrele
    if (schoolId) {
      students = await getStudentsBySchool(parseInt(schoolId));
    } else if (tokenData.isAdmin) {
      // Admin tüm öğrencileri görebilir
      students = await getAllStudents();
    } else {
      // Normal kullanıcılar için okul ID gerekli
      return NextResponse.json(
        { error: 'Okul ID belirtilmedi' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Error getting students:', error);
    return NextResponse.json(
      { error: 'Öğrencileri getirirken bir hata oluştu' },
      { status: 500 }
    );
  }
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
    
    const studentData = await req.json();
    
    // Temel doğrulama
    if (!studentData.StudentName) {
      return NextResponse.json(
        { error: 'Öğrenci adı zorunludur' },
        { status: 400 }
      );
    }
    
    // SchoolID kontrolü
    if (!studentData.SchoolID) {
      return NextResponse.json(
        { error: 'Okul ID zorunludur' },
        { status: 400 }
      );
    }
    
    // Admin olmayan kullanıcılar sadece kendi okullarının öğrencilerini ekleyebilir
    // Burada kontrolü ekleyebilirsiniz
    
    const newStudent = await createStudent({
      StudentName: studentData.StudentName,
      Classroom: studentData.Classroom || 0,
      City: studentData.City || '',
      Town: studentData.Town || '',
      Neighborhood: studentData.Neighborhood || '',
      AddressText: studentData.AddressText || '',
      ParentName1: studentData.ParentName1 || '',
      ParentPhone1: studentData.ParentPhone1 || '',
      ParentName2: studentData.ParentName2 || '',
      ParentPhone2: studentData.ParentPhone2 || '',
      StudentIDNumber: studentData.StudentIDNumber || '',
      Parent1IDNumber: studentData.Parent1IDNumber || '',
      Parent2IDNumber: studentData.Parent2IDNumber || '',
      VehicleID: studentData.VehicleID || null,
      SchoolID: studentData.SchoolID
    });
    
    if (!newStudent) {
      return NextResponse.json(
        { error: 'Öğrenci oluşturulamadı' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      student: newStudent
    }, { status: 201 });
  } catch (error) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: 'Öğrenci oluşturma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}