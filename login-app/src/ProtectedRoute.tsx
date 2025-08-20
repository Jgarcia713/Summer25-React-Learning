// ProtectedRoute.tsx
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" replace />;
}
