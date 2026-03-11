
import React, { useState, useEffect } from 'react';
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
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { dbService } from './services/db';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navParams, setNavParams] = useState<any>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  useEffect(() => {
    const initFarm = async () => {
      const farms = await dbService.getAllFarms();
      if (farms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farms[0].id);
      }
    };
    initFarm();
  }, []);

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

  return (
    <ThemeProvider>
        <LanguageProvider>
        <NotificationProvider>
            <Layout 
              currentPage={currentPage} 
              onNavigate={handleNavigate}
              headerExtra={<FarmSelector selectedFarmId={selectedFarmId} onSelectFarm={setSelectedFarmId} />}
            >
            {renderPage()}
            </Layout>
        </NotificationProvider>
        </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
