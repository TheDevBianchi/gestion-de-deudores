import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Debtor from '@/models/Debtor';
import Product from '@/services/models/product';

export async function GET() {
  try {
    await dbConnect();
    
    // Aseguramos que el modelo Product esté registrado antes de hacer el populate
    const debtors = await Debtor.find({})
      .sort({ createdAt: -1 })
      .populate('deudas.productos.producto');

    return NextResponse.json(debtors);
  } catch (error) {
    console.error('Error en GET /api/debtors:', error);
    return NextResponse.json(
      { error: 'Error al obtener los deudores' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Asegurarse de que el campo deudas esté presente
    if (!data.deudas) {
      data.deudas = [];
    }
    
    // Crear el deudor
    const newDebtor = await Debtor.create(data);
    
    // Devolver el objeto completo
    return NextResponse.json(newDebtor);
  } catch (error) {
    console.error('Error creando deudor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear deudor' },
      { status: 500 }
    );
  }
}

// Archivo: src/app/api/debtors/[id]/route.js
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    const debtor = await Debtor.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(debtor);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar el deudor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const debtor = await Debtor.findByIdAndDelete(id);
    
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Deudor eliminado correctamente' }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar el deudor' },
      { status: 500 }
    );
  }
} 