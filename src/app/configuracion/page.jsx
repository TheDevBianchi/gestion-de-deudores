'use client';

import { Suspense, lazy, memo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Importación lazy para mejorar el rendimiento
const DollarPriceConfig = lazy(() => import('@/components/config/DollarPriceConfig'));

// Contenido principal de configuración 
const ConfigPageContent = memo(function ConfigPageContent() {
  return (
    <Tabs defaultValue="dollarPrice" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="dollarPrice">Precio del Dólar</TabsTrigger>
        <TabsTrigger value="general" disabled>General</TabsTrigger>
        <TabsTrigger value="users" disabled>Usuarios</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dollarPrice">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Precio del Dólar</CardTitle>
            <CardDescription>
              Administra el tipo de cambio que se usará en la aplicación para convertir precios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando configuración del dólar...</div>}>
              <DollarPriceConfig />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
              Configuraciones generales de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección está en desarrollo. Próximamente podrás configurar opciones generales
              como impuestos, moneda predeterminada, etc.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra los usuarios que tienen acceso a la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección está en desarrollo. Próximamente podrás gestionar usuarios,
              roles y permisos.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
});

// Componente principal de la página
function ConfiguracionPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-6"
    >
      <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
      
      <Suspense fallback={<div>Cargando configuración...</div>}>
        <ConfigPageContent />
      </Suspense>
    </motion.div>
  );
}

export default ConfiguracionPage; 