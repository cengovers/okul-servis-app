import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/models/user';
import { getTokenData } from '@/lib/auth/utils';

export async function POST(req: NextRequest) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData || !tokenData.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const userData = await req.json();
    
    // Temel doğrulama
    if (!userData.UserName || !userData.Password || !userData.NameSurname) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, şifre ve ad-soyad zorunludur' },
        { status: 400 }
      );
    }
    
    const newUser = await createUser({
        UserName: userData.UserName,
        Password: userData.Password,
        NameSurname: userData.NameSurname,
        PhoneNumber: userData.PhoneNumber || '',
        eMail: userData.eMail || ''
      });
    
    if (!newUser) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      );
    }
    
    // Şifre içermeyen yanıt oluştur
    const userResponse = {
      UserID: newUser.UserID,
      UserName: newUser.UserName,
      NameSurname: newUser.NameSurname,
      eMail: newUser.eMail,
      PhoneNumber: newUser.PhoneNumber,
      CreatedDate: newUser.CreatedDate,
      ModifiedDate: newUser.ModifiedDate
    };
    
    return NextResponse.json({
      success: true,
      user: userResponse
    }, { status: 201 });
  } catch (error: any) {
    console.error('User creation error:', error);
    
    // Duplicate key hatası
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Kullanıcı oluşturma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}