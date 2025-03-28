import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precioCompra: {
    type: Number,
    required: [true, 'El precio de compra es obligatorio'],
    min: 0
  },
  porcentajeGanancia: {
    type: Number,
    default: 20,
    min: 0
  },
  cantidadPorPaquete: {
    type: Number,
    default: 1,
    min: 1,
    required: [true, 'La cantidad por paquete es obligatoria']
  },
  cantidadPaquetes: {
    type: Number,
    default: 0,
    min: 0
  },
  cantidadUnidadesSueltas: {
    type: Number,
    default: 0,
    min: 0
  },
  precioUnitario: {
    type: Number,
    default: function() {
      const precioBase = this.precioCompra * (1 + this.porcentajeGanancia / 100);
      return precioBase / (this.cantidadPorPaquete || 1);
    }
  },
  precioVenta: {
    type: Number,
    default: function() {
      return this.precioCompra * (1 + this.porcentajeGanancia / 100);
    }
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
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

// Agregar virtual para obtener el total de unidades
productSchema.virtual('cantidadInventario').get(function() {
  return (this.cantidadPaquetes * this.cantidadPorPaquete) + this.cantidadUnidadesSueltas;
});

productSchema.pre('save', function(next) {
  // Calcular precio unitario (precio por unidad dentro del paquete)
  const precioBase = this.precioCompra * (1 + this.porcentajeGanancia / 100);
  if (this.cantidadPorPaquete && this.cantidadPorPaquete > 0) {
    this.precioUnitario = precioBase / this.cantidadPorPaquete;
  } else {
    this.precioUnitario = precioBase;
  }
  
  // Calcular precio de venta basado en porcentaje de ganancia
  this.precioVenta = this.precioCompra * (1 + this.porcentajeGanancia / 100);
  
  // Actualizar fecha de modificación
  this.updatedAt = new Date();
  
  next();
});

productSchema.index({ categoria: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 