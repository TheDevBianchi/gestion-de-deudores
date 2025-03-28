import mongoose from 'mongoose';

const debtorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido']
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es requerida']
  },
  deudas: {
    type: [{
      productos: [{
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        cantidad: {
          type: Number,
          required: true,
          min: [1, 'La cantidad debe ser mayor a 0']
        },
        precioUnitario: {
          type: Number,
          required: true
        },
        subtotal: {
          type: Number,
          required: true
        }
      }],
      montoTotal: {
        type: Number,
        required: true,
        min: [0, 'El monto no puede ser negativo']
      },
      montoPendiente: {
        type: Number,
        required: true,
        min: [0, 'El monto pendiente no puede ser negativo']
      },
      estado: {
        type: String,
        enum: ['pendiente', 'pagada', 'vencida'],
        default: 'pendiente'
      },
      abonos: [{
        monto: {
          type: Number,
          required: true,
          min: [0, 'El monto del abono no puede ser negativo']
        },
        fecha: {
          type: Date,
          default: Date.now
        }
      }],
      descripcion: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
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
  timestamps: true
});

// Middleware para actualizar updatedAt antes de cada actualización
debtorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.deudas) {
    this.deudas = [];
  }
  next();
});

const Debtor = mongoose.models.Debtor || mongoose.model('Debtor', debtorSchema);

export default Debtor; 