import mongoose from 'mongoose';

const deudaSchema = new mongoose.Schema({
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number
  }],
  montoTotal: Number,
  montoPendiente: Number,
  estado: {
    type: String,
    enum: ['pendiente', 'pagada'],
    default: 'pendiente'
  },
  abonos: [{
    monto: Number,
    descripcion: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  fecha: {
    type: Date,
    default: Date.now
  },
  tasaDolar: {
    promedio: Number,
    bancoCentral: Number,
    paralelo: Number
  }
}, { _id: true }, { timestamps: true });

const debtorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    default: '',
    trim: true
  },
  direccion: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: 'cliente@sistemaventas.com',
    trim: true
  },
  deudas: [deudaSchema],
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
  versionKey: false
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