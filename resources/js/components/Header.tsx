import { router } from '@inertiajs/react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-emerald-200/50 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
              ☰
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative">
                🔔
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
            
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              👤
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

