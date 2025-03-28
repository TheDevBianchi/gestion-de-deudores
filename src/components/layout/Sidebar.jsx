'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings,
  Menu,
  X,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Inventario', icon: Package, path: '/productos' },
  { name: 'Ventas', icon: ShoppingCart, path: '/sales' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Deudores', icon: CreditCard, path: '/deudores' },
  { name: 'Finanzas', icon: DollarSign, path: '/finanzas' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' }
];

const Sidebar = memo(function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '70px' },
  };

  const mobileMenuVariants = {
    open: { 
      x: 0,
      transition: { type: 'tween' } 
    },
    closed: { 
      x: '-100%',
      transition: { type: 'tween' } 
    }
  };

  // Renderizado condicional para móvil o escritorio
  if (isMobile) {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          <Menu />
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
              />
              
              <motion.div
                className="fixed left-0 top-0 bottom-0 w-[240px] bg-white dark:bg-gray-950 z-50 border-r shadow-xl"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="flex justify-between items-center p-4">
                  <div className="font-bold text-xl">Sistema</div>
                  <Button variant="ghost" size="icon" onClick={closeSidebar}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="px-3 py-2">
                  {menuItems.map((item) => (
                    <Link 
                      href={item.path} 
                      key={item.path}
                      onClick={closeSidebar}
                    >
                      <div 
                        className={`
                          flex items-center p-3 my-1 rounded-md transition-colors
                          ${pathname === item.path 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Versión de escritorio
  return (
    <motion.div
      className="hidden lg:block h-screen border-r bg-white dark:bg-gray-950 sticky top-0 overflow-y-auto scrollbar-hide"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && <div className="font-bold text-xl">Sistema</div>}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className={isCollapsed ? 'mx-auto' : ''}
        >
          <ChevronRight className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      <div className="px-2 py-2">
        {menuItems.map((item) => (
          <Link href={item.path} key={item.path}>
            <div 
              className={`
                flex items-center p-3 my-1 rounded-md transition-colors
                ${pathname === item.path 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
});

export default Sidebar; 