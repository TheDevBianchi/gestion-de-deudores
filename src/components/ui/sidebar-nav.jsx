'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

// Elemento individual de la barra lateral
const NavItem = React.memo(({ icon: Icon, href, title, active, collapsed }) => {
  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1",
          active ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted",
          collapsed ? "px-2" : "px-4"
        )}
      >
        <Icon size={20} className={cn(collapsed ? "mx-auto" : "mr-2")} />
        {!collapsed && <span>{title}</span>}
      </Button>
    </Link>
  );
});

// Componente principal de la barra lateral
export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Rutas de navegación
  const navItems = useMemo(() => [
    { href: "/", title: "Inicio Y Reportes", icon: Home },
    { href: "/sales", title: "Ventas", icon: ShoppingCart },
    { href: "/productos", title: "Inventario", icon: Package },
    { href: "/deudores", title: "Deudores", icon: Users },
    { href: "/configuracion", title: "Configuración", icon: Settings }
  ], []);
  
  // Modo colapsado y expandido
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r shadow-sm transition-all duration-300 flex flex-col justify-between",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo y encabezado */}
      <div>
        <div className={cn(
          "h-16 border-b flex items-center px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <h1 className="font-bold text-xl">Bodega La Gonzalera</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapsed}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Elementos de navegación */}
        <nav className="p-2 mt-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              title={item.title}
              icon={item.icon}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
      
      {/* Botón de cerrar sesión en la parte inferior */}
      <div className={cn(
        "p-2 border-t mb-4",
        collapsed ? "mt-auto" : ""
      )}>
        <Button 
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600",
            collapsed ? "px-2" : "px-4",
            "mt-2"
          )}
        >
          <LogOut size={20} className={cn(collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
} 