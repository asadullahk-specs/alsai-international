import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
