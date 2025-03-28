import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { SidebarNav } from '@/components/ui/sidebar-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistema de Gestión',
  description: 'Sistema de gestión de deudores, inventario y ventas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar */}
          <SidebarNav />
          {/* Contenido principal */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
