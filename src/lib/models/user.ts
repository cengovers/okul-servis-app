import db from '../db';
import { hashPassword } from '../auth/utils';

export interface User {
  UserID: number;
  UserName: string;
  Password: string;
  NameSurname: string;
  PhoneNumber: string;
  eMail: string;
  CreatedDate: Date;
  ModifiedDate: Date;
  isAdmin?: boolean;
  // Küçük harfli alan adları için alternatif alanlar
  userid?: number;
  username?: string;
  password?: string;
  namesurname?: string;
  phonenumber?: string;
  email?: string;
  createddate?: Date;
  modifieddate?: Date;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    console.log("Kullanıcı aranıyor:", username);
    const user = await db.oneOrNone('SELECT * FROM Users WHERE UserName = $1', [username]);
    
    // Debug için kullanıcı bilgilerini yazdır
    console.log("Bulunan kullanıcı:", user ? JSON.stringify(user) : "null");
    
    if (user) {
      // Tüm alanların isimlerini kontrol et
      console.log("Kullanıcı alan adları:", Object.keys(user));
      
      // PostgreSQL'den dönen alan adları küçük harfli olabilir
      // Büyük harfli alanlar için küçük harfli alternatifler kontrol ediyoruz
      if (user.password && !user.Password) {
        user.Password = user.password;
      }
      if (user.username && !user.UserName) {
        user.UserName = user.username;
      }
      if (user.userid && !user.UserID) {
        user.UserID = user.userid;
      }
      if (user.namesurname && !user.NameSurname) {
        user.NameSurname = user.namesurname;
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

export async function findUserById(userId: number): Promise<User | null> {
  try {
    const user = await db.oneOrNone('SELECT * FROM Users WHERE UserID = $1', [userId]);
    
    if (user) {
      // PostgreSQL'den dönen alan adları küçük harfli olabilir
      if (user.password && !user.Password) {
        user.Password = user.password;
      }
      if (user.username && !user.UserName) {
        user.UserName = user.username;
      }
      if (user.userid && !user.UserID) {
        user.UserID = user.userid;
      }
      if (user.namesurname && !user.NameSurname) {
        user.NameSurname = user.namesurname;
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

export async function createUser(userData: Omit<User, 'UserID' | 'CreatedDate' | 'ModifiedDate'>): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.Password);
    
    return db.one(`
      INSERT INTO Users (UserName, Password, NameSurname, PhoneNumber,eMail)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userData.UserName, hashedPassword, userData.NameSurname, userData.PhoneNumber, userData.eMail]);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}