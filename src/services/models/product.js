import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  precioCompra: {
    type: Number,
    required: [true, 'El precio de compra es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  porcentajeGanancia: {
    type: Number,
    required: [true, 'El porcentaje de ganancia es requerido'],
    min: [0, 'El porcentaje no puede ser negativo']
  },
  cantidadInventario: {
    type: Number,
    required: [true, 'La cantidad en inventario es requerida'],
    min: [0, 'La cantidad no puede ser negativa']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular el precio de venta
productSchema.virtual('precioVenta').get(function() {
  return this.precioCompra * (1 + this.porcentajeGanancia / 100);
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 