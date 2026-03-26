import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePage } from '@inertiajs/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  header?: string;
}

const AdminLayout = ({ children, header }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto py-8 px-6">
              {header && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900">{header}</h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2" />
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

