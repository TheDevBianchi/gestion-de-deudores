'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  MoreVertical,
  Trash2,
  Eye,
  Plus,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import NewDebtModal from '@/components/debtors/NewDebtModal'; 

const DebtorRow = memo(function DebtorRow({ debtor, onEdit, onDelete, onAddDebt }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const router = useRouter();
  
  const handleView = () => {
    router.push(`/deudores/${debtor._id}`);
  };
  
  const handleDelete = async () => {
    try {
      await onDelete(debtor._id);
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error al eliminar deudor:', error);
    }
  };
  
  const handleNewDebtSuccess = () => {
    setShowDebtModal(false);
  };
  
  // Calcular deudas totales y pendientes
  const totalDebt = debtor.deudas?.reduce((sum, deuda) => sum + deuda.montoTotal, 0) || 0;
  const pendingDebt = debtor.deudas?.reduce((sum, deuda) => sum + deuda.montoPendiente, 0) || 0;
  const hasPendingDebts = pendingDebt > 0;
  
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="font-medium">{debtor.nombre}</div>
          <div className="text-sm text-muted-foreground">
            {debtor.telefono || 'Sin teléfono'}
          </div>
        </TableCell>
        <TableCell>
          {hasPendingDebts ? (
            <div className="flex flex-col">
              <span className="font-medium text-red-600">${pendingDebt.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">
                Total: ${totalDebt.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-medium text-green-600">Al día</span>
              <span className="text-xs text-muted-foreground">
                Total pagado: ${totalDebt.toFixed(2)}
              </span>
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{debtor.deudas?.length || 0}</span>
          </div>
        </TableCell>
        <TableCell>
          {hasPendingDebts ? (
            <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50 border-red-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Pendiente
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50 border-green-200">
              Al día
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDebtModal(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar deuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(debtor)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteAlert(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Modal para eliminar deudor */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al deudor {debtor.nombre} y todos sus registros de deudas. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal para agregar deuda */}
      <NewDebtModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        debtorId={debtor._id}
        debtorName={debtor.nombre}
        onSuccess={handleNewDebtSuccess}
      />
    </>
  );
});

const DebtorList = memo(function DebtorList({ debtors, onEditDebtor, deleteDebtorById }) {
  return (
    <Card className="overflow-hidden border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Deudor</TableHead>
              <TableHead className="font-semibold">Deuda Pendiente</TableHead>
              <TableHead className="font-semibold">Total Facturas</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron deudores
                </TableCell>
              </TableRow>
            ) : (
              debtors.map((debtor) => (
                <DebtorRow 
                  key={debtor._id} 
                  debtor={debtor} 
                  onEdit={onEditDebtor}
                  onDelete={deleteDebtorById}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});

export default DebtorList; 