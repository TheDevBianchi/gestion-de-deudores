 import connectToDB from '@/lib/dbConnect';
import Product from '@/services/models/product';
import { NextResponse } from 'next/server';

// GET - Obtener todos los productos
export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(request) {
  try {
    const data = await request.json();
    await connectToDB();
    
    const newProduct = new Product({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precioCompra: data.precioCompra,
      precioVenta: data.precioVenta,
      cantidadInventario: data.cantidadInventario,
      categoria: data.categoria,
      porcentajeGanancia: data.porcentajeGanancia
    });
    
    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear producto', message: error.message },
      { status: 400 }
    );
  }
} 