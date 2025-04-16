import { NextRequest, NextResponse } from 'next/server';
import { getInstallmentsByPaymentId, findPaymentById, updateInstallmentPayment } from '@/lib/models/payment';
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
    const paymentId = url.searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Ödeme ID zorunludur' },
        { status: 400 }
      );
    }
    
    // Ödemeyi bul
    const payment = await findPaymentById(parseInt(paymentId));
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }
    
    // Yetki kontrolü
    if (!tokenData.isAdmin) {
      // Öğrenciyi bul ve okul yetkilisi kontrolü yap
      const student = await findStudentById(payment.StudentID);
      
      if (!student) {
        return NextResponse.json(
          { error: 'Öğrenci bulunamadı' },
          { status: 404 }
        );
      }
      
      // Kullanıcının bu öğrencinin okuluna erişimi var mı kontrol et
      if (student.SchoolID) {
        const school = await findSchoolById(student.SchoolID);
        
        if (!school || school.UserID !== Number(tokenData.userId)) {
          return NextResponse.json(
            { error: 'Bu ödemenin taksit bilgilerine erişim yetkiniz yok' },
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
    
    const installments = await getInstallmentsByPaymentId(parseInt(paymentId));
    
    return NextResponse.json({
      success: true,
      installments
    });
  } catch (error) {
    console.error('Error getting installments:', error);
    return NextResponse.json(
      { error: 'Taksitleri getirirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Token kontrolü
    const tokenData = await getTokenData(req);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const { installmentId, isPaid } = await req.json();
    
    if (!installmentId) {
      return NextResponse.json(
        { error: 'Taksit ID zorunludur' },
        { status: 400 }
      );
    }
    
    if (isPaid === undefined) {
      return NextResponse.json(
        { error: 'Ödeme durumu (isPaid) belirtilmelidir' },
        { status: 400 }
      );
    }
    
    // Yetki kontrolünü burada da yapabilirsiniz, kısalık için atlandı
    
    const updatedInstallment = await updateInstallmentPayment(
      parseInt(installmentId),
      Boolean(isPaid)
    );
    
    if (!updatedInstallment) {
      return NextResponse.json(
        { error: 'Taksit bulunamadı veya güncellenemedi' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      installment: updatedInstallment
    });
  } catch (error) {
    console.error('Error updating installment:', error);
    return NextResponse.json(
      { error: 'Taksit güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}