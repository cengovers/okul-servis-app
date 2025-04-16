import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPaymentsByStudentId } from '@/lib/models/payment';
import { findStudentById } from '@/lib/models/student';
import { findSchoolById } from '@/lib/models/school';
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
    const studentId = url.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Öğrenci ID zorunludur' },
        { status: 400 }
      );
    }
    
    // Yetki kontrolü
    if (!tokenData.isAdmin) {
      // Öğrenciyi bul ve okul yetkilisi kontrolü yap
      const student = await findStudentById(parseInt(studentId));
      
      if (!student) {
        return NextResponse.json(
          { error: 'Öğrenci bulunamadı' },
          { status: 404 }
        );
      }
      
      // Kullanıcının bu öğrencinin okuluna erişimi var mı kontrol et
      if (student.SchoolID) {
        const school = await findSchoolById(student.SchoolID);
        
        if (!school || school.UserID !== tokenData.userId) {
          return NextResponse.json(
            { error: 'Bu öğrencinin ödeme bilgilerine erişim yetkiniz yok' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Öğrenci herhangi bir okula kayıtlı değil' },
          { status: 400 }
        );
      }
    }
    
    const payments = await getPaymentsByStudentId(parseInt(studentId));
    
    return NextResponse.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    return NextResponse.json(
      { error: 'Ödemeleri getirirken bir hata oluştu' },
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
    
    const paymentData = await req.json();
    
    // Temel doğrulama
    if (!paymentData.StudentID || !paymentData.TotalAmount || !paymentData.PaymentType || !paymentData.StartDate) {
      return NextResponse.json(
        { error: 'Öğrenci ID, toplam tutar, ödeme tipi ve başlangıç tarihi zorunludur' },
        { status: 400 }
      );
    }
    
    // PaymentType kontrolü
    if (paymentData.PaymentType !== 'Peşin' && paymentData.PaymentType !== 'Taksitli') {
      return NextResponse.json(
        { error: 'Ödeme tipi "Peşin" veya "Taksitli" olmalıdır' },
        { status: 400 }
      );
    }
    
    // Taksitli ise taksit sayısı kontrolü
    if (paymentData.PaymentType === 'Taksitli' && (!paymentData.Installments || paymentData.Installments < 2)) {
      return NextResponse.json(
        { error: 'Taksitli ödemeler için taksit sayısı en az 2 olmalıdır' },
        { status: 400 }
      );
    }
    
    // Yetki kontrolü
    if (!tokenData.isAdmin) {
      // Öğrenciyi bul ve okul yetkilisi kontrolü yap
      const student = await findStudentById(paymentData.StudentID);
      
      if (!student) {
        return NextResponse.json(
          { error: 'Öğrenci bulunamadı' },
          { status: 404 }
        );
      }
      
      // Kullanıcının bu öğrencinin okuluna erişimi var mı kontrol et
      if (student.SchoolID) {
        const school = await findSchoolById(student.SchoolID);
        
        if (!school || school.UserID !== tokenData.userId) {
          return NextResponse.json(
            { error: 'Bu öğrenci için ödeme oluşturma yetkiniz yok' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Öğrenci herhangi bir okula kayıtlı değil' },
          { status: 400 }
        );
      }
    }
    
    // Peşin ödemeler için taksit sayısı 1 olmalı
    const installments = paymentData.PaymentType === 'Peşin' ? 1 : paymentData.Installments;
    
    const newPayment = await createPayment({
      StudentID: paymentData.StudentID,
      TotalAmount: paymentData.TotalAmount,
      PaymentType: paymentData.PaymentType,
      StartDate: new Date(paymentData.StartDate),
      Installments: installments
    });
    
    if (!newPayment) {
      return NextResponse.json(
        { error: 'Ödeme oluşturulamadı' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Ödeme ve taksitler başarıyla oluşturuldu'
    }, { status: 201 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Ödeme oluşturma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}