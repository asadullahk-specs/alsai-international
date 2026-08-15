import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandSpinner from '../components/BrandSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
