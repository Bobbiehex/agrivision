
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CropDashboard } from './components/CropDashboard';
import { LivestockDashboard } from './components/LivestockDashboard';
import { AIAssistant } from './components/AIAssistant';
import { DashboardPage } from './components/DashboardPage';
import { AboutPage } from './components/AboutPage';
import { BlogPage } from './components/BlogPage';
import { SettingsPage } from './components/SettingsPage';
import { FarmSelector } from './components/FarmSelector';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { dbService } from './services/db';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navParams, setNavParams] = useState<any>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const initFarm = async () => {
      const farms = await dbService.getAllFarms();
      if (farms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farms[0].id);
      }
    };
    initFarm();
  }, [selectedFarmId]); // added dependency

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavParams(params || null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'overview': return <OverviewDashboard farmId={selectedFarmId} />;
      case 'crops': return <CropDashboard initialCropId={navParams?.id} farmId={selectedFarmId} />;
      case 'livestock': return <LivestockDashboard initialAnimalId={navParams?.id} farmId={selectedFarmId} />;
      case 'ai-advisor': return <AIAssistant farmId={selectedFarmId} />;
      case 'about': return <AboutPage />;
      case 'blog': return <BlogPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const ProtectedApp = (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate}
      headerExtra={<FarmSelector selectedFarmId={selectedFarmId} onSelectFarm={setSelectedFarmId} />}
    >
      {renderPage()}
    </Layout>
  );

  return (
    <ThemeProvider>
        <LanguageProvider>
        <NotificationProvider>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
              <Route path="/*" element={user ? ProtectedApp : <Navigate to="/login" />} />
            </Routes>
        </NotificationProvider>
        </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
