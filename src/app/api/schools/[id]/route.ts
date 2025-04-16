import { NextRequest, NextResponse } from 'next/server';
import { findSchoolById, updateSchool, deleteSchool } from '@/lib/models/school';
import { getTokenData } from '@/lib/auth/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const schoolId = parseInt(params.id);
    
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: 'Geçersiz okul ID' },
        { status: 400 }
      );
    }
    
    const school = await findSchoolById(schoolId);
    
    if (!school) {
      return NextResponse.json(
        { error: 'Okul bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı yetkisi kontrolü: admin veya okul sorumlusu
    if (!tokenData.isAdmin && school.UserID !== tokenData.userId) {
      return NextResponse.json(
        { error: 'Bu okula erişim yetkiniz yok' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      school
    });
  } catch (error) {
    console.error('Error getting school:', error);
    return NextResponse.json(
      { error: 'Okul bilgisi getirirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const schoolId = parseInt(params.id);
    
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: 'Geçersiz okul ID' },
        { status: 400 }
      );
    }
    
    // Okulu kontrol et
    const school = await findSchoolById(schoolId);
    
    if (!school) {
      return NextResponse.json(
        { error: 'Okul bulunamadı' },
        { status: 404 }
      );
    }
    
    // Yetki kontrolü
    if (!tokenData.isAdmin && school.UserID !== tokenData.userId) {
      return NextResponse.json(
        { error: 'Bu okulu düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const schoolData = await req.json();
    
    // Admin olmayan kullanıcılar UserID değiştiremez
    if (!tokenData.isAdmin && schoolData.UserID && schoolData.UserID !== school.UserID) {
      return NextResponse.json(
        { error: 'Okul sorumlusunu değiştirme yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const updatedSchool = await updateSchool(schoolId, schoolData);
    
    if (!updatedSchool) {
      return NextResponse.json(
        { error: 'Okul güncellenemedi' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      school: updatedSchool
    });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { error: 'Okul güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const schoolId = parseInt(params.id);
    
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: 'Geçersiz okul ID' },
        { status: 400 }
      );
    }
    
    const success = await deleteSchool(schoolId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Okul bulunamadı veya silinemedi' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Okul başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { error: 'Okul silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}