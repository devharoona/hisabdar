import React, { useState } from 'react';
    import { Menu, X, LayoutDashboard, Users, FileText, PieChart, IndianRupee, Settings, LogOut, Cloud, CheckCircle2 } from 'lucide-react';
    import { PageView } from '../types';
    
    interface LayoutProps {
      children: React.ReactNode;
      currentPage: PageView;
      onNavigate: (page: PageView) => void;
      onLogout: () => void;
      businessName: string;
    }
    
    const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onLogout, businessName }) => {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
      const navItems: { id: PageView; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'customers', label: 'Hisab Books', icon: Users },
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'expenses', label: 'Expenses', icon: IndianRupee },
        { id: 'reports', label: 'Reports', icon: PieChart },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    
      const handleNav = (page: PageView) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      };
    
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col md:flex-row no-print">
          {/* Mobile Header */}
          <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center sticky top-0 z-20">
            <h1 className="text-xl font-bold text-amber-500 flex items-center gap-2">
               Hisabdar
            </h1>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-300 hover:bg-stone-800 rounded-lg">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
    
          {/* Sidebar (Desktop) / Drawer (Mobile) */}
          <aside className={`
            fixed inset-y-0 left-0 z-10 w-64 bg-stone-900 border-r border-stone-800 transform transition-transform duration-200 ease-in-out
            md:translate-x-0 md:static md:h-screen
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-stone-800 hidden md:block">
                <h1 className="text-2xl font-bold text-amber-500 tracking-tight">Hisabdar</h1>
                <p className="text-xs text-stone-500 mt-1">Welcome, {businessName}</p>
              </div>
              
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentPage === item.id 
                        ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-lg shadow-amber-900/20 font-medium' 
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </nav>
    
              <div className="p-4 border-t border-stone-800 space-y-4">
                 {/* Sync Indicator */}
                <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-900/20 p-3 rounded-lg">
                    <CheckCircle2 size={14} />
              <span>Securely synced</span>
                </div>

                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
              </div>
            </div>
          </aside>
    
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-stone-950">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
    
          {/* Overlay for mobile menu */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-0 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      );
    };
    
    export default Layout;
