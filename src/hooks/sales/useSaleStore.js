import { create } from 'zustand';

export const useSaleStore = create((set, get) => ({
  // Estado inicial
  items: [],
  total: "0.00",
  totalBsF: "0.00",
  dollarPrice: 0,
  
  // Establecer el precio del dólar
  setDollarPrice: (price) => set({ dollarPrice: price }),
  
  // Añadir o actualizar un producto
  updateItem: (index, item, product) => {
    const items = [...get().items];
    
    // Si el índice es mayor que la longitud actual, estamos añadiendo un nuevo producto
    if (index >= items.length) {
      items[index] = {
        productoId: item.productoId,
        cantidad: item.cantidad || 1,
        tipoVenta: item.tipoVenta || 'unidad',
        product: product
      };
    } else {
      // Actualizar un producto existente
      items[index] = {
        ...items[index],
        ...item,
        product: product || items[index].product
      };
    }
    
    set({ items });
    get().recalculateTotal();
  },
  
  // Eliminar un producto
  removeItem: (index) => {
    const items = [...get().items];
    items.splice(index, 1);
    set({ items });
    get().recalculateTotal();
  },
  
  // Limpiar todos los productos
  clearItems: () => {
    set({ 
      items: [],
      total: "0.00",
      totalBsF: "0.00"
    });
  },
  
  // Recalcular el total basado en los productos actuales
  recalculateTotal: () => {
    const { items, dollarPrice } = get();
    let sum = 0;
    
    console.log("Recalculando total con Zustand:", items);
    
    // Calcular el total iterando por todos los productos
    items.forEach((item) => {
      if (!item.product) return;
      
      const tipoVenta = item.tipoVenta || 'unidad';
      const cantidad = parseInt(item.cantidad) || 0;
      
      if (item.subtotal && typeof item.subtotal === 'number') {
        sum += item.subtotal;
        return;
      }
      
      const precioCompraPaquete = item.product.precioCompra || 0;
      const porcentajeGanancia = item.product.porcentajeGanancia || 0;
      const cantidadPorPaquete = item.product.cantidadPorPaquete || 1;
      
      const precioVentaPaquete = precioCompraPaquete * (1 + porcentajeGanancia / 100);
      const precioVentaUnitario = precioVentaPaquete / cantidadPorPaquete;
      
      // Precio según tipo de venta
      const precioFinal = tipoVenta === 'paquete' ? precioVentaPaquete : precioVentaUnitario;
      
      console.log(`Producto ${item.productoId}: tipoVenta=${tipoVenta}, precio=${precioFinal.toFixed(2)}, cantidad=${cantidad}`);
      
      const subtotal = precioFinal * cantidad;
      sum += subtotal;
      
      // Actualizar el subtotal en el item
      item.subtotal = subtotal;
      item.precioUnitario = precioFinal;
    });
    
    // Actualizar los totales
    const totalFormatted = sum.toFixed(2);
    const totalBsF = (sum * (dollarPrice || 0)).toFixed(2);
    
    console.log(`Total calculado con Zustand: $${totalFormatted}`);
    
    set({ 
      total: totalFormatted,
      totalBsF: totalBsF,
      items: [...get().items]  // Force update para que se reflejen los cambios de subtotal
    });
  },
  
  // Sincronizar con el formulario
  syncWithForm: (formValues, products) => {
    if (!formValues.productos || !Array.isArray(formValues.productos)) return;
    
    const newItems = formValues.productos.map(item => {
      const product = products.find(p => p._id === item.productoId);
      if (!product) return null;
      
      return {
        ...item,
        product
      };
    }).filter(Boolean);
    
    set({ items: newItems });
    get().recalculateTotal();
  }
})); 