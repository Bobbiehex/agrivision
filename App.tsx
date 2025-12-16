
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CropDashboard } from './components/CropDashboard';
import { LivestockDashboard } from './components/LivestockDashboard';
import { AIAssistant } from './components/AIAssistant';
import { SettingsPage } from './components/SettingsPage';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [navParams, setNavParams] = useState<any>(null);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavParams(params || null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <OverviewDashboard />;
      case 'crops': return <CropDashboard initialCropId={navParams?.id} />;
      case 'livestock': return <LivestockDashboard initialAnimalId={navParams?.id} />;
      case 'ai-advisor': return <AIAssistant />;
      case 'settings': return <SettingsPage />;
      default: return <OverviewDashboard />;
    }
  };

  return (
    <ThemeProvider>
        <LanguageProvider>
        <NotificationProvider>
            <Layout currentPage={currentPage} onNavigate={handleNavigate}>
            {renderPage()}
            </Layout>
        </NotificationProvider>
        </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
