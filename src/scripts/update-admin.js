require('dotenv').config();
const pgp = require('pg-promise')();
const bcryptjs = require('bcryptjs');

// Veritabanı bağlantısı
const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'school_service_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

console.log('Veritabanı bağlantısı kuruluyor...');
const db = pgp(connection);

async function updateAdmin() {
  try {
    // Bağlantı testi
    await db.one('SELECT 1 as test');
    console.log('Veritabanı bağlantısı başarılı');
    
    // Admin şifresini güncelle - büyük/küçük harf duyarsız arama
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const result = await db.result(`
      UPDATE Users
      SET Password = $1
      WHERE LOWER(UserName) = LOWER('admin')
    `, [hashedPassword]);
    
    if (result.rowCount > 0) {
      console.log('Admin şifresi başarıyla güncellendi');
      
      // Doğrulama için kullanıcıyı sorgula
      const user = await db.oneOrNone('SELECT * FROM Users WHERE LOWER(UserName) = LOWER($1)', ['admin']);
      console.log('Güncellenmiş kullanıcı bilgileri:', user ? JSON.stringify(user, null, 2) : 'Bulunamadı');
    } else {
      console.log('Admin kullanıcısı bulunamadı');
      
      // Admin kullanıcısı yoksa oluştur
      await db.none(`
        INSERT INTO Users (UserName, Password, NameSurname, PhoneNumber)
        VALUES ($1, $2, $3, $4)
      `, ['admin', hashedPassword, 'Admin Kullanıcı', '']);
      
      console.log('Admin kullanıcısı oluşturuldu');
      
      // Doğrulama için yeni kullanıcıyı sorgula
      const newUser = await db.oneOrNone('SELECT * FROM Users WHERE LOWER(UserName) = LOWER($1)', ['admin']);
      console.log('Yeni kullanıcı bilgileri:', newUser ? JSON.stringify(newUser, null, 2) : 'Bulunamadı');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Hata:', error);
    return { success: false, error };
  } finally {
    pgp.end();
  }
}

// Güncelleme işlemini başlat
updateAdmin();