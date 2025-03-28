'use client';

import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  Clock,
  FileText,
  CreditCard,
  Check,
  AlertTriangle,
  PlusCircle,
  Mail,
  MapPin,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const DebtorSummary = memo(function DebtorSummary({ debtor }) {
  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalDebt = debtor.deudas?.reduce((sum, deuda) => sum + deuda.montoTotal, 0) || 0;
    const pendingDebt = debtor.deudas?.reduce((sum, deuda) => sum + deuda.montoPendiente, 0) || 0;
    const paidDebt = totalDebt - pendingDebt;
    const pendingDebts = debtor.deudas?.filter(deuda => deuda.estado === 'pendiente')?.length || 0;
    const totalDebts = debtor.deudas?.length || 0;
    const paidDebts = totalDebts - pendingDebts;
    
    return {
      totalDebt,
      pendingDebt,
      paidDebt,
      totalDebts,
      pendingDebts,
      paidDebts
    };
  }, [debtor.deudas]);
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-blue-900">{debtor.nombre}</CardTitle>
            <CardDescription>{debtor.descripcion || 'Cliente Regular'}</CardDescription>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="text-sm text-muted-foreground mb-1">Balance</div>
            <div className="text-xl font-bold text-blue-600">
              ${stats.pendingDebt.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Teléfono</div>
            </div>
            <p className="ml-6 text-gray-600">{debtor.telefono || 'No registrado'}</p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Email</div>
            </div>
            <p className="ml-6 text-gray-600">{debtor.email || 'No registrado'}</p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Dirección</div>
            </div>
            <p className="ml-6 text-gray-600">{debtor.direccion || 'No registrada'}</p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Cliente desde</div>
            </div>
            <p className="ml-6 text-gray-600">
              {debtor.createdAt 
                ? format(new Date(debtor.createdAt), 'PPP', { locale: es })
                : 'Fecha desconocida'
              }
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-6">
          <div className="col-span-1 bg-white/70 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-sm text-muted-foreground">Total Facturas</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalDebts}</p>
          </div>
          
          <div className="col-span-1 bg-white/70 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-sm text-muted-foreground">Pagadas</p>
            <p className="text-xl font-bold text-green-600">{stats.paidDebts}</p>
          </div>
          
          <div className="col-span-1 bg-white/70 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-xl font-bold text-amber-600">{stats.pendingDebts}</p>
          </div>
          
          <div className="col-span-1 bg-white/70 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-sm text-muted-foreground">Total Deuda</p>
            <p className="text-xl font-bold text-red-600">${stats.totalDebt.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const DebtItem = memo(function DebtItem({ debt, debtorId, onAddPayment }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const formattedDate = debt.createdAt 
    ? format(new Date(debt.createdAt), 'PPP', { locale: es })
    : 'Fecha desconocida';
  
  const dueDate = debt.fechaVencimiento
    ? format(new Date(debt.fechaVencimiento), 'PPP', { locale: es })
    : 'No establecida';
  
  const isPending = debt.estado === 'pendiente';
  const isPaid = debt.estado === 'pagada';
  const isOverdue = isPending && debt.fechaVencimiento && new Date(debt.fechaVencimiento) < new Date();
  
  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Pagada
        </Badge>
      );
    } else if (isOverdue) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencida
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    }
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div 
          className={`p-4 cursor-pointer border-l-4 ${
            isPaid 
              ? 'border-l-green-500' 
              : isOverdue 
                ? 'border-l-red-500' 
                : 'border-l-amber-500'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className={`h-5 w-5 ${
                isPaid 
                  ? 'text-green-500' 
                  : isOverdue 
                    ? 'text-red-500' 
                    : 'text-amber-500'
              }`} />
              <div>
                <p className="font-medium">{debt.descripcion || `Deuda #${debt._id.slice(-6)}`}</p>
                <p className="text-xs text-muted-foreground">
                  Creada el {formattedDate}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <div className="text-right">
                <p className="font-bold">
                  ${debt.montoTotal.toFixed(2)}
                </p>
                {isPending && (
                  <p className="text-xs text-red-600">
                    Pendiente: ${debt.montoPendiente.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="p-4 pt-0 border-t bg-gray-50">
              {debt.fechaVencimiento && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Fecha de vencimiento:</span>
                  <span className={`text-sm font-medium ${
                    isOverdue ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {dueDate}
                  </span>
                </div>
              )}
              
              {/* Productos */}
              {debt.productos && debt.productos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Productos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debt.productos.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.producto?.nombre || 'Producto'}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>${item.precioUnitario?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.subtotal?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Abonos */}
              {debt.abonos && debt.abonos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Abonos realizados</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debt.abonos.map((abono, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(new Date(abono.fecha), 'PPP', { locale: es })}
                          </TableCell>
                          <TableCell>{abono.descripcion || '-'}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            ${abono.monto.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {isPending && !debt._id.toString().startsWith('temp-') && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => onAddPayment(debt._id, debt.montoPendiente)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Registrar Abono
                  </Button>
                </div>
              )}
              {isPending && debt._id.toString().startsWith('temp-') && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    disabled
                    className="bg-gray-400"
                    title="Espere a que se sincronice la deuda"
                  >
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
});

const DebtList = memo(function DebtList({ debts = [], debtorId, onAddPayment }) {
  // Asegurarnos que debts sea siempre un array, incluso si es undefined
  const safeDebts = Array.isArray(debts) ? debts : [];
  
  const pendingDebts = useMemo(() => {
    return safeDebts.filter(debt => debt?.estado === 'pendiente');
  }, [safeDebts]);
  
  const paidDebts = useMemo(() => {
    return safeDebts.filter(debt => debt?.estado === 'pagada');
  }, [safeDebts]);
  
  if (!debts || debts.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No hay deudas registradas para este deudor</p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="pending">
          Pendientes ({pendingDebts.length})
        </TabsTrigger>
        <TabsTrigger value="paid">
          Pagadas ({paidDebts.length})
        </TabsTrigger>
        <TabsTrigger value="all">
          Todas ({safeDebts.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-0">
        {pendingDebts.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay deudas pendientes</p>
          </div>
        ) : (
          pendingDebts.map(debt => (
            <DebtItem 
              key={debt._id || `temp-${Date.now()}`}
              debt={debt} 
              debtorId={debtorId} 
              onAddPayment={onAddPayment} 
            />
          ))
        )}
      </TabsContent>
      
      <TabsContent value="paid" className="mt-0">
        {paidDebts.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay deudas pagadas</p>
          </div>
        ) : (
          paidDebts.map(debt => (
            <DebtItem 
              key={debt._id} 
              debt={debt} 
              debtorId={debtorId} 
              onAddPayment={onAddPayment} 
            />
          ))
        )}
      </TabsContent>
      
      <TabsContent value="all" className="mt-0">
        {safeDebts.map(debt => (
          <DebtItem 
            key={debt._id} 
            debt={debt} 
            debtorId={debtorId} 
            onAddPayment={onAddPayment} 
          />
        ))}
      </TabsContent>
    </Tabs>
  );
});

// Componente principal de detalles de deudor
const DebtorDetails = memo(function DebtorDetails({ debtor, onAddPayment, onAddDebt }) {
  return (
    <div className="space-y-6">
      <DebtorSummary debtor={debtor} />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Historial de Deudas</CardTitle>
            {onAddDebt && (
              <Button 
                onClick={onAddDebt}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Deuda
              </Button>
            )}
          </div>
          <CardDescription>
            Todas las deudas y pagos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DebtList 
            debts={debtor.deudas} 
            debtorId={debtor._id}
            onAddPayment={onAddPayment}
          />
        </CardContent>
      </Card>
    </div>
  );
});

export default DebtorDetails;