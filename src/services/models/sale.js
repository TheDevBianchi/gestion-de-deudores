import mongoose from 'mongoose';

const productoVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  productos: [productoVentaSchema],
  montoTotal: {
    type: Number,
    required: true
  },
  clienteId: {
    type: String,
    default: 'default'
  },
  clienteNombre: String,
  esCredito: {
    type: Boolean,
    default: false
  },
  estado: {
    type: String,
    enum: ['completada', 'pendiente'],
    default: 'completada'
  }
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema); 