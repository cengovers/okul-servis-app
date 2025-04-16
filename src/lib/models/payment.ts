import db from '../db';

export interface Payment {
  PaymentID: number;
  StudentID: number;
  TotalAmount: number;
  PaymentType: string; // "Peşin" veya "Taksitli"
  StartDate: Date;
  Installments: number;
  CreatedDate: Date;
  ModifiedDate: Date;
}

export interface Installment {
  InstallmentID: number;
  PaymentID: number;
  DueDate: Date;
  Amount: number;
  isPaid: boolean;
  paidAt: Date | null;
}

export async function findPaymentById(paymentId: number): Promise<Payment | null> {
  try {
    return db.oneOrNone('SELECT * FROM Payments WHERE PaymentID = $1', [paymentId]);
  } catch (error) {
    console.error('Error finding payment:', error);
    return null;
  }
}

export async function getPaymentsByStudentId(studentId: number): Promise<Payment[]> {
  try {
    return db.any('SELECT * FROM Payments WHERE StudentID = $1 ORDER BY CreatedDate DESC', [studentId]);
  } catch (error) {
    console.error('Error getting payments by student:', error);
    return [];
  }
}

export async function getInstallmentsByPaymentId(paymentId: number): Promise<Installment[]> {
  try {
    return db.any('SELECT * FROM Installments WHERE PaymentID = $1 ORDER BY DueDate', [paymentId]);
  } catch (error) {
    console.error('Error getting installments:', error);
    return [];
  }
}

export async function createPayment(paymentData: Omit<Payment, 'PaymentID' | 'CreatedDate' | 'ModifiedDate'>): Promise<Payment | null> {
  try {
    // Transaction başlat
    return db.tx(async t => {
      // 1. Ödeme oluştur
      const payment = await t.one(`
        INSERT INTO Payments (
          StudentID, TotalAmount, PaymentType, StartDate, Installments
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        paymentData.StudentID,
        paymentData.TotalAmount,
        paymentData.PaymentType,
        paymentData.StartDate,
        paymentData.Installments
      ]);
      
      // 2. Peşin ödemeyse tek taksit, taksitli ise birden fazla taksit oluştur
      if (paymentData.PaymentType === 'Peşin') {
        // Peşin ödeme için tek taksit
        await t.none(`
          INSERT INTO Installments (
            PaymentID, DueDate, Amount, isPaid, paidAt
          )
          VALUES ($1, $2, $3, $4, $5)
        `, [
          payment.PaymentID,
          paymentData.StartDate,
          paymentData.TotalAmount,
          true, // Peşin ödemeler genelde ödenmiş olur
          new Date() // Bugünün tarihi
        ]);
      } else {
        // Taksitli ödeme için taksitleri oluştur
        const installmentAmount = parseFloat((paymentData.TotalAmount / paymentData.Installments).toFixed(2));
        const startDate = new Date(paymentData.StartDate);
        
        for (let i = 0; i < paymentData.Installments; i++) {
          // Taksit tarihini hesapla (her ay için)
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          // Son taksitin tutarı, yuvarlama farklarını düzeltmek için ayarlanabilir
          const amount = i === paymentData.Installments - 1
            ? paymentData.TotalAmount - (installmentAmount * (paymentData.Installments - 1))
            : installmentAmount;
          
          await t.none(`
            INSERT INTO Installments (
              PaymentID, DueDate, Amount, isPaid, paidAt
            )
            VALUES ($1, $2, $3, $4, $5)
          `, [
            payment.PaymentID,
            dueDate,
            amount,
            false, // İlk başta ödenmemiş
            null
          ]);
        }
      }
      
      return payment;
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
  }
}

export async function updateInstallmentPayment(installmentId: number, isPaid: boolean): Promise<Installment | null> {
  try {
    return db.one(`
      UPDATE Installments
      SET isPaid = $1, paidAt = $2
      WHERE InstallmentID = $3
      RETURNING *
    `, [
      isPaid,
      isPaid ? new Date() : null,
      installmentId
    ]);
  } catch (error) {
    console.error('Error updating installment payment:', error);
    return null;
  }
}

export async function deletePayment(paymentId: number): Promise<boolean> {
  try {
    // Transaction içinde önce taksitleri sonra ödemeyi sil
    return db.tx(async t => {
      // Önce taksitleri sil
      await t.none('DELETE FROM Installments WHERE PaymentID = $1', [paymentId]);
      
      // Sonra ödemeyi sil
      const result = await t.result('DELETE FROM Payments WHERE PaymentID = $1', [paymentId]);
      return result.rowCount > 0;
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
}