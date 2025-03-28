import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/services/models/category';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ nombre: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validaciones básicas
    if (!data.nombre) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }
    
    const category = new Category(data);
    await category.save();
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear categoría' },
      { status: 500 }
    );
  }
} 