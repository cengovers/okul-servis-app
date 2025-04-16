// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/models/user';
import { comparePasswords, createToken } from '@/lib/auth/utils';

// POST metodu
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }
    
    // Kullanıcıyı bul
    const user = await findUserByUsername(username);
    console.log("Login içinde user:", user ? "bulundu" : "bulunamadı");
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Şifre alanını kontrol et - küçük veya büyük harfli olabilir
    const userPassword = user.Password || user.password;
    console.log("Şifre bilgisi var mı:", userPassword ? "var" : "yok");
    
    if (!userPassword) {
      return NextResponse.json(
        { error: 'Kullanıcı şifre bilgisi bulunamadı' },
        { status: 500 }
      );
    }
    
    // Şifreyi kontrol et
    const passwordMatch = await comparePasswords(password, userPassword);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 401 }
      );
    }
    
    // Admin mi kontrol et (geçici olarak UserID = 1 ise admin kabul ediyoruz)
    const userId = user.UserID || user.userid || 0;
    const isAdmin = userId === 1;
    
    // JWT token oluştur
    const token = await createToken(
      userId,
      user.UserName || user.username || "",
      isAdmin
    );
    
    // Token'ı doğrudan API yanıtında döndür
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        username: user.UserName || user.username,
        name: user.NameSurname || user.namesurname,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}