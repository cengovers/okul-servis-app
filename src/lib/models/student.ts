import db from '../db';

export interface Student {
  StudentID: number;
  StudentName: string;
  Classroom: number;
  City: string;
  Town: string;
  Neighborhood: string;
  AddressText: string;
  ParentName1: string;
  ParentPhone1: string;
  ParentName2: string;
  ParentPhone2: string;
  StudentIDNumber: string;
  Parent1IDNumber: string;
  Parent2IDNumber: string;
  VehicleID: number | null;
  SchoolID: number | null;
  CreatedDate: Date;
  ModifiedDate: Date;
}

export async function findStudentById(studentId: number): Promise<Student | null> {
  try {
    return db.oneOrNone('SELECT * FROM Students WHERE StudentID = $1', [studentId]);
  } catch (error) {
    console.error('Error finding student:', error);
    return null;
  }
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    return db.any('SELECT * FROM Students ORDER BY StudentID');
  } catch (error) {
    console.error('Error getting all students:', error);
    return [];
  }
}

export async function getStudentsBySchool(schoolId: number): Promise<Student[]> {
  try {
    return db.any('SELECT * FROM Students WHERE SchoolID = $1 ORDER BY StudentID', [schoolId]);
  } catch (error) {
    console.error('Error getting students by school:', error);
    return [];
  }
}

export async function getStudentsByVehicle(vehicleId: number): Promise<Student[]> {
  try {
    return db.any('SELECT * FROM Students WHERE VehicleID = $1 ORDER BY StudentID', [vehicleId]);
  } catch (error) {
    console.error('Error getting students by vehicle:', error);
    return [];
  }
}

export async function createStudent(studentData: Omit<Student, 'StudentID' | 'CreatedDate' | 'ModifiedDate'>): Promise<Student | null> {
  try {
    return db.one(`
      INSERT INTO Students (
        StudentName, Classroom, City, Town, Neighborhood, AddressText,
        ParentName1, ParentPhone1, ParentName2, ParentPhone2,
        StudentIDNumber, Parent1IDNumber, Parent2IDNumber,
        VehicleID, SchoolID
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      studentData.StudentName,
      studentData.Classroom,
      studentData.City,
      studentData.Town,
      studentData.Neighborhood,
      studentData.AddressText,
      studentData.ParentName1,
      studentData.ParentPhone1,
      studentData.ParentName2,
      studentData.ParentPhone2,
      studentData.StudentIDNumber,
      studentData.Parent1IDNumber,
      studentData.Parent2IDNumber,
      studentData.VehicleID,
      studentData.SchoolID
    ]);
  } catch (error) {
    console.error('Error creating student:', error);
    return null;
  }
}

export async function updateStudent(studentId: number, studentData: Partial<Student>): Promise<Student | null> {
  try {
    const currentStudent = await findStudentById(studentId);
    if (!currentStudent) return null;

    return db.one(`
      UPDATE Students
      SET StudentName = $1, Classroom = $2, City = $3, Town = $4, 
          Neighborhood = $5, AddressText = $6, ParentName1 = $7, 
          ParentPhone1 = $8, ParentName2 = $9, ParentPhone2 = $10,
          StudentIDNumber = $11, Parent1IDNumber = $12, Parent2IDNumber = $13,
          VehicleID = $14, SchoolID = $15, ModifiedDate = CURRENT_TIMESTAMP
      WHERE StudentID = $16
      RETURNING *
    `, [
      studentData.StudentName || currentStudent.StudentName,
      studentData.Classroom || currentStudent.Classroom,
      studentData.City || currentStudent.City,
      studentData.Town || currentStudent.Town,
      studentData.Neighborhood || currentStudent.Neighborhood,
      studentData.AddressText || currentStudent.AddressText,
      studentData.ParentName1 || currentStudent.ParentName1,
      studentData.ParentPhone1 || currentStudent.ParentPhone1,
      studentData.ParentName2 || currentStudent.ParentName2,
      studentData.ParentPhone2 || currentStudent.ParentPhone2,
      studentData.StudentIDNumber || currentStudent.StudentIDNumber,
      studentData.Parent1IDNumber || currentStudent.Parent1IDNumber,
      studentData.Parent2IDNumber || currentStudent.Parent2IDNumber,
      studentData.VehicleID !== undefined ? studentData.VehicleID : currentStudent.VehicleID,
      studentData.SchoolID !== undefined ? studentData.SchoolID : currentStudent.SchoolID,
      studentId
    ]);
  } catch (error) {
    console.error('Error updating student:', error);
    return null;
  }
}

export async function deleteStudent(studentId: number): Promise<boolean> {
  try {
    const result = await db.result('DELETE FROM Students WHERE StudentID = $1', [studentId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
}