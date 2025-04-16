import { NextRequest, NextResponse } from 'next/server';
import { createVehicle, getAllVehicles } from '@/lib/models/vehicle';
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
    
    const vehicles = await getAllVehicles();
    
    return NextResponse.json({
      success: true,
      vehicles
    });
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return NextResponse.json(
      { error: 'Araçları getirirken bir hata oluştu' },
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
    
    const vehicleData = await req.json();
    
    // Temel doğrulama
    if (!vehicleData.PlateNumber) {
      return NextResponse.json(
        { error: 'Plaka numarası zorunludur' },
        { status: 400 }
      );
    }
    
    const newVehicle = await createVehicle({
      PlateNumber: vehicleData.PlateNumber,
      Route: vehicleData.Route || '',
      DriverName: vehicleData.DriverName || '',
      DriverPhone: vehicleData.DriverPhone || '',
      Capacity: vehicleData.Capacity || 0,
      Occupancy: vehicleData.Occupancy || 0
    });
    
    if (!newVehicle) {
      return NextResponse.json(
        { error: 'Araç oluşturulamadı' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      vehicle: newVehicle
    }, { status: 201 });
  } catch (error: any) {
    console.error('Vehicle creation error:', error);
    
    // Duplicate key hatası
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Bu plaka numarası zaten kullanılıyor' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Araç oluşturma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}