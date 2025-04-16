// migrate.js
require('dotenv').config();
const pgp = require('pg-promise')();

// Veritabanı bağlantısı
const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'school_service_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

console.log('Veritabanı bağlantısı kuruluyor...', {
  host: connection.host,
  port: connection.port,
  database: connection.database,
  user: connection.user
});

const db = pgp(connection);

async function runMigrations() {
  try {
    // Bağlantı testi
    await db.one('SELECT 1 as test');
    console.log('Veritabanı bağlantısı başarılı');
    
    // Users tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Users (
        UserID SERIAL PRIMARY KEY,
        UserName VARCHAR(255) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        NameSurname VARCHAR(255) NOT NULL,
        PhoneNumber VARCHAR(255),
        eMail VARCHAR(255),
        CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ModifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Users tablosu oluşturuldu');
    
    // Schools tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Schools (
        SchoolID SERIAL PRIMARY KEY,
        SchoolName VARCHAR(500) NOT NULL,
        UserID INTEGER REFERENCES Users(UserID),
        City VARCHAR(255),
        Town VARCHAR(255),
        Neighborhood VARCHAR(255),
        AddressText VARCHAR(500),
        PhoneNumber VARCHAR(255),
        CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ModifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Schools tablosu oluşturuldu');
    
    // Vehicles tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Vehicles (
        VehicleID SERIAL PRIMARY KEY,
        PlateNumber VARCHAR(20) UNIQUE NOT NULL,
        Route VARCHAR(255),
        DriverName VARCHAR(255),
        DriverPhone VARCHAR(255),
        Capacity INTEGER DEFAULT 0,
        Occupancy INTEGER DEFAULT 0,
        CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ModifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Vehicles tablosu oluşturuldu');
    
    // Students tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Students (
        StudentID SERIAL PRIMARY KEY,
        StudentName VARCHAR(255) NOT NULL,
        Classroom INTEGER,
        City VARCHAR(255),
        Town VARCHAR(255),
        Neighborhood VARCHAR(255),
        AddressText VARCHAR(500),
        ParentName1 VARCHAR(255),
        ParentPhone1 VARCHAR(255),
        ParentName2 VARCHAR(255),
        ParentPhone2 VARCHAR(255),
        StudentIDNumber VARCHAR(64),
        Parent1IDNumber VARCHAR(64),
        Parent2IDNumber VARCHAR(64),
        VehicleID INTEGER REFERENCES Vehicles(VehicleID) ON DELETE SET NULL,
        SchoolID INTEGER REFERENCES Schools(SchoolID) ON DELETE SET NULL,
        CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ModifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Students tablosu oluşturuldu');
    
    // Payments tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Payments (
        PaymentID SERIAL PRIMARY KEY,
        StudentID INTEGER REFERENCES Students(StudentID) ON DELETE CASCADE,
        TotalAmount DECIMAL(10,2) NOT NULL,
        PaymentType VARCHAR(50) NOT NULL,
        StartDate DATE NOT NULL,
        Installments INTEGER DEFAULT 1,
        CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ModifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Payments tablosu oluşturuldu');
    
    // Installments tablosu
    await db.none(`
      CREATE TABLE IF NOT EXISTS Installments (
        InstallmentID SERIAL PRIMARY KEY,
        PaymentID INTEGER REFERENCES Payments(PaymentID) ON DELETE CASCADE,
        DueDate DATE NOT NULL,
        Amount DECIMAL(10,2) NOT NULL,
        isPaid BOOLEAN DEFAULT FALSE,
        paidAt DATE
      )
    `);
    
    console.log('Installments tablosu oluşturuldu');
    
    // Admin kullanıcı oluştur (eğer yoksa)
    const adminUser = await db.oneOrNone('SELECT * FROM Users WHERE UserID = 1');
    if (!adminUser) {
      // Bcrypt ile şifre hashlemek için
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.none(`
        INSERT INTO Users (UserName, Password, NameSurname, PhoneNumber,eMail)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', hashedPassword, 'Admin Kullanıcı', '']);
      
      console.log('Admin kullanıcı oluşturuldu');
    }
    
    console.log('Tüm tablolar başarıyla oluşturuldu');
    return { success: true };
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    return { success: false, error };
  } finally {
    pgp.end(); // Veritabanı bağlantısını kapat
  }
}

// Migrasyon başlat
runMigrations();