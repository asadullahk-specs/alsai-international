import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-cream-50 overflow-hidden">
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Mobile/tablet sidebar - always mounted so the slide/fade transitions can run */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black/40"
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
