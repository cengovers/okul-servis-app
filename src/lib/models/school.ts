import db from '../db';

export interface School {
  SchoolID: number;
  SchoolName: string;
  UserID: number;
  City: string;
  Town: string;
  Neighborhood: string;
  AddressText: string;
  PhoneNumber: string;
  CreatedDate: Date;
  ModifiedDate: Date;
}

export async function findSchoolById(schoolId: number): Promise<School | null> {
  try {
    return db.oneOrNone('SELECT * FROM Schools WHERE SchoolID = $1', [schoolId]);
  } catch (error) {
    console.error('Error finding school:', error);
    return null;
  }
}

export async function getSchoolsByUserId(userId: number): Promise<School[]> {
  try {
    return db.any('SELECT * FROM Schools WHERE UserID = $1', [userId]);
  } catch (error) {
    console.error('Error getting schools by user:', error);
    return [];
  }
}

export async function getAllSchools(): Promise<School[]> {
  try {
    return db.any('SELECT * FROM Schools ORDER BY SchoolName');
  } catch (error) {
    console.error('Error getting all schools:', error);
    return [];
  }
}

export async function createSchool(schoolData: Omit<School, 'SchoolID' | 'CreatedDate' | 'ModifiedDate'>): Promise<School | null> {
  try {
    return db.one(`
      INSERT INTO Schools (
        SchoolName, UserID, City, Town, Neighborhood,
        AddressText, PhoneNumber
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      schoolData.SchoolName,
      schoolData.UserID,
      schoolData.City || '',
      schoolData.Town || '',
      schoolData.Neighborhood || '',
      schoolData.AddressText || '',
      schoolData.PhoneNumber || ''
    ]);
  } catch (error) {
    console.error('Error creating school:', error);
    return null;
  }
}

export async function updateSchool(schoolId: number, schoolData: Partial<School>): Promise<School | null> {
  try {
    const currentSchool = await findSchoolById(schoolId);
    if (!currentSchool) return null;

    return db.one(`
      UPDATE Schools
      SET SchoolName = $1, UserID = $2, City = $3, Town = $4,
          Neighborhood = $5, AddressText = $6, PhoneNumber = $7,
          ModifiedDate = CURRENT_TIMESTAMP
      WHERE SchoolID = $8
      RETURNING *
    `, [
      schoolData.SchoolName || currentSchool.SchoolName,
      schoolData.UserID || currentSchool.UserID,
      schoolData.City || currentSchool.City,
      schoolData.Town || currentSchool.Town,
      schoolData.Neighborhood || currentSchool.Neighborhood,
      schoolData.AddressText || currentSchool.AddressText,
      schoolData.PhoneNumber || currentSchool.PhoneNumber,
      schoolId
    ]);
  } catch (error) {
    console.error('Error updating school:', error);
    return null;
  }
}

export async function deleteSchool(schoolId: number): Promise<boolean> {
  try {
    const result = await db.result('DELETE FROM Schools WHERE SchoolID = $1', [schoolId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting school:', error);
    return false;
  }
}