import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/services/models/product';
import Category from '@/services/models/category';

// GET - Obtener todos los productos
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    
    let query = {};
    if (categoria) {
      if (categoria === 'none') {
        query.categoria = { $exists: false };
      } else {
        query.categoria = categoria;
      }
    }
    
    const products = await Product.find(query)
      .sort({ nombre: 1 })
      .populate('categoria');
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Calcular campos adicionales
    data.precioUnitario = data.precioCompra / (data.cantidadPorPaquete || 1);
    data.precioVenta = data.precioCompra * (1 + data.porcentajeGanancia / 100);
    
    const product = new Product(data);
    await product.save();
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
} 