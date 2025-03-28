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
    
    // Validar que los datos requeridos estén presentes
    if (!data.nombre || !data.apellido || !data.telefono || !data.direccion) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Si hay deudas, validar que tengan los campos necesarios
    if (data.deudas && data.deudas.length > 0) {
      for (const deuda of data.deudas) {
        if (!deuda.productos || !deuda.productos.length) {
          return NextResponse.json(
            { message: 'Cada deuda debe tener al menos un producto' },
            { status: 400 }
          );
        }
      }
    }

    const debtor = await Debtor.create(data);
    await debtor.populate('deudas.productos.producto');
    
    return NextResponse.json(debtor, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/debtors:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          message: 'Error de validación',
          errors: Object.values(error.errors).map(err => err.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Error al crear el deudor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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