import db from '../db';

export interface Vehicle {
  VehicleID: number;
  PlateNumber: string;
  Route: string;
  DriverName: string;
  DriverPhone: string;
  Capacity: number;
  Occupancy: number;
  CreatedDate: Date;
  ModifiedDate: Date;
}

export async function findVehicleById(vehicleId: number): Promise<Vehicle | null> {
  try {
    return db.oneOrNone('SELECT * FROM Vehicles WHERE VehicleID = $1', [vehicleId]);
  } catch (error) {
    console.error('Error finding vehicle:', error);
    return null;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    return db.any('SELECT * FROM Vehicles ORDER BY VehicleID');
  } catch (error) {
    console.error('Error getting all vehicles:', error);
    return [];
  }
}

export async function createVehicle(vehicleData: Omit<Vehicle, 'VehicleID' | 'CreatedDate' | 'ModifiedDate'>): Promise<Vehicle | null> {
  try {
    return db.one(`
      INSERT INTO Vehicles (PlateNumber, Route, DriverName, DriverPhone, Capacity, Occupancy)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      vehicleData.PlateNumber,
      vehicleData.Route,
      vehicleData.DriverName,
      vehicleData.DriverPhone,
      vehicleData.Capacity,
      vehicleData.Occupancy
    ]);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return null;
  }
}

export async function updateVehicle(vehicleId: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> {
  try {
    const currentVehicle = await findVehicleById(vehicleId);
    if (!currentVehicle) return null;

    return db.one(`
      UPDATE Vehicles
      SET PlateNumber = $1, Route = $2, DriverName = $3, DriverPhone = $4, 
          Capacity = $5, Occupancy = $6, ModifiedDate = CURRENT_TIMESTAMP
      WHERE VehicleID = $7
      RETURNING *
    `, [
      vehicleData.PlateNumber || currentVehicle.PlateNumber,
      vehicleData.Route || currentVehicle.Route,
      vehicleData.DriverName || currentVehicle.DriverName,
      vehicleData.DriverPhone || currentVehicle.DriverPhone,
      vehicleData.Capacity || currentVehicle.Capacity,
      vehicleData.Occupancy || currentVehicle.Occupancy,
      vehicleId
    ]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return null;
  }
}

export async function deleteVehicle(vehicleId: number): Promise<boolean> {
  try {
    const result = await db.result('DELETE FROM Vehicles WHERE VehicleID = $1', [vehicleId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return false;
  }
}