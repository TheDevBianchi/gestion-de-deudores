 import connectToDB from '@/lib/dbConnect';
import Product from '@/services/models/product';
import { NextResponse } from 'next/server';

// GET - Obtener un producto específico
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDB();
    
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el producto', message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    await connectToDB();
    
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizar campos
    product.nombre = data.nombre;
    product.descripcion = data.descripcion;
    product.precioCompra = data.precioCompra;
    product.precioVenta = data.precioVenta;
    product.cantidadInventario = data.cantidadInventario;
    product.categoria = data.categoria;
    product.porcentajeGanancia = data.porcentajeGanancia;
    
    await product.save();
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el producto', message: error.message },
      { status: 400 }
    );
  }
}

// DELETE - Eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await connectToDB();
    
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el producto', message: error.message },
      { status: 500 }
    );
  }
} 