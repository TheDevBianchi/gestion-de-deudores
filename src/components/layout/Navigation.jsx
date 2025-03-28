'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart4,
  DollarSign
} from 'lucide-react';

const NavItem = memo(function NavItem({ href, icon: Icon, children, isActive }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );
});

const Navigation = memo(function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="space-y-1 py-2">
      <NavItem 
        href="/dashboard" 
        icon={BarChart4} 
        isActive={isActive('/dashboard')}
      >
        Dashboard
      </NavItem>
      
      <NavItem 
        href="/productos" 
        icon={Package} 
        isActive={isActive('/productos')}
      >
        Productos
      </NavItem>
      
      <NavItem 
        href="/ventas" 
        icon={ShoppingCart} 
        isActive={isActive('/ventas')}
      >
        Ventas
      </NavItem>
      
      <NavItem 
        href="/clientes" 
        icon={Users} 
        isActive={isActive('/clientes')}
      >
        Clientes
      </NavItem>
      
      <NavItem 
        href="/configuracion" 
        icon={Settings} 
        isActive={isActive('/configuracion')}
      >
        Configuración
      </NavItem>
      
      <NavItem 
        href="/configuracion/dollarPrice" 
        icon={DollarSign} 
        isActive={isActive('/configuracion/dollarPrice')}
      >
        Precio Dólar
      </NavItem>
    </nav>
  );
});

export default Navigation; 