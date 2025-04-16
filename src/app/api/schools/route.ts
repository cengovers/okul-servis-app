import { NextRequest, NextResponse } from 'next/server';
import { createSchool, getAllSchools, getSchoolsByUserId } from '@/lib/models/school';
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
    
    let schools;
    
    // Admin tüm okulları görebilir, normal kullanıcılar sadece kendi okullarını
    if (tokenData.isAdmin) {
      schools = await getAllSchools();
    } else {
      // token içindeki userId tipine dikkat et
      const userId = Number(tokenData.userId);
      schools = await getSchoolsByUserId(userId);
    }
    
    return NextResponse.json({
      success: true,
      schools
    });
  } catch (error) {
    console.error('Error getting schools:', error);
    return NextResponse.json(
      { error: 'Okulları getirirken bir hata oluştu' },
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
    
    // Admin kontrolü
    if (!tokenData.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const schoolData = await req.json();
    
    // Temel doğrulama
    if (!schoolData.SchoolName || !schoolData.UserID) {
      return NextResponse.json(
        { error: 'Okul adı ve Kullanıcı ID zorunludur' },
        { status: 400 }
      );
    }
    
    const newSchool = await createSchool({
      SchoolName: schoolData.SchoolName,
      UserID: schoolData.UserID,
      City: schoolData.City || '',
      Town: schoolData.Town || '',
      Neighborhood: schoolData.Neighborhood || '',
      AddressText: schoolData.AddressText || '',
      PhoneNumber: schoolData.PhoneNumber || ''
    });
    
    if (!newSchool) {
      return NextResponse.json(
        { error: 'Okul oluşturulamadı' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      school: newSchool
    }, { status: 201 });
  } catch (error) {
    console.error('School creation error:', error);
    return NextResponse.json(
      { error: 'Okul oluşturma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}