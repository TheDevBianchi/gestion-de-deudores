import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Sale from '@/services/models/sale';

export async function GET() {
  try {
    await dbConnect();
    
    // Obtener las 10 ventas más recientes con sus productos
    const recentSales = await Sale.find({})
      .sort({ fecha: -1 })
      .limit(10)
      .lean();
    
    return NextResponse.json(recentSales);
  } catch (error) {
    console.error('Error obteniendo ventas recientes:', error);
    return NextResponse.json(
      { error: 'Error al cargar ventas recientes' },
      { status: 500 }
    );
  }
} 