import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

function ProductRow({ index, control, errors, products, onRemove, onProductSelect, watchProductId, watchTipoVenta }) {
  const { averagePrice, centralBankPrice, parallelPrice } = useDollarPrice();
  
  // Función para calcular precio por tipo de venta
  const calculatePrice = useCallback((product, tipoVenta) => {
    if (!product) return { usd: "0.00", bs: { promedio: "0.00", bancoCentral: "0.00", paralelo: "0.00" } };
    
    const precioUSD = tipoVenta === 'unidad' 
      ? (product.precioUnitario || 0) 
      : (product.precioVenta || 0);
      
    return {
      usd: precioUSD.toFixed(2),
      bs: {
        promedio: (precioUSD * averagePrice).toFixed(2),
        bancoCentral: (precioUSD * centralBankPrice).toFixed(2),
        paralelo: (precioUSD * parallelPrice).toFixed(2)
      }
    };
  }, [averagePrice, centralBankPrice, parallelPrice]);
  
  // Calcular precios para el producto seleccionado
  const selectedProduct = watchProductId ? products.find(p => p._id === watchProductId) : null;
  const precios = calculatePrice(selectedProduct, watchTipoVenta);
  
  return (
    <div className="col-span-2">
      <FormItem>
        <FormLabel className={index !== 0 ? "sr-only" : ""}>
          Precio
        </FormLabel>
        <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 text-right">
          ${precios.usd}
        </div>
      </FormItem>
      
      {/* Mostrar precios en bolivares si hay producto seleccionado */}
      {selectedProduct && (
        <div className="mt-1 text-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help flex items-center text-muted-foreground">
                <span>Ver precios en Bs.</span>
                <HelpCircle className="ml-1 h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent className="w-60">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Promedio:</span>
                    <span className="font-medium">Bs. {precios.bs.promedio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BCV:</span>
                    <span className="font-medium">Bs. {precios.bs.bancoCentral}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paralelo:</span>
                    <span className="font-medium">Bs. {precios.bs.paralelo}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export default ProductRow; 