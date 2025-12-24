import { Routes, Route, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import IdeaDetail from './pages/IdeaDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useKindeAuth();

    // DEV MODE BYPASS
    if (import.meta.env.DEV || true) return <>{children}</>;

    if (isLoading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/" />;

    return <>{children}</>;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/idea/:id" element={
                <ProtectedRoute>
                    <IdeaDetail />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
