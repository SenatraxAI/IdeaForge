import { Routes, Route, Navigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import React, { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import IdeaDetail from './pages/IdeaDetail';
import { setAuthToken } from './lib/api';

import Docs from './pages/Docs';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useKindeAuth();

    if (isLoading) return <div className="min-h-screen bg-[#010409] text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Syncing Neural Link</p>
    </div>;

    if (!isAuthenticated) return <Navigate to="/" />;

    return <>{children}</>;
}

import GlobalSidebar from './components/GlobalSidebar';

function AppContent() {
    const { getToken, isAuthenticated, isLoading } = useKindeAuth();

    useEffect(() => {
        const initAuth = async () => {
            if (isAuthenticated) {
                try {
                    const token = await getToken();
                    setAuthToken(token || null);
                } catch (err) {
                    console.error("Failed to set auth token", err);
                }
            } else {
                setAuthToken(null);
            }
        };
        initAuth();
    }, [isAuthenticated, getToken]);

    if (isLoading) return null;

    return (
        <GlobalSidebar>
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
                <Route path="/docs" element={<Docs />} />
            </Routes>
        </GlobalSidebar>
    );
}

function App() {
    return (
        <AppContent />
    );
}

export default App;
