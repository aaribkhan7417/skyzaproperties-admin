import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import AlertBanner from './components/AlertBanner';
import SalesChart from './components/SalesChart';
import GrowthChart from './components/GrowthChart';
import ListingBoard from './components/ListingBoard';
import AISuggestion from './components/AISuggestion';
import PropertiesModule from './components/PropertiesModule';
import SalesModule from './components/SalesModule';
import RentModule from './components/RentModule';
import ClientsModule from './components/ClientsModule';
import TeamModule from './components/TeamModule';
import TestimonialsModule from './components/TestimonialsModule';
import PartnersModule from './components/PartnersModule';
import CMSModule from './components/CMSModule';
import SettingsModule from './components/SettingsModule';
import SubscribersModule from './components/SubscribersModule';
import LocationsModule from './components/LocationsModule';
import SeoManager from './components/SeoManager';
import Login from './components/Login';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleInquirySelect = (id: string) => {
    setSelectedInquiryId(id);
    setActiveTab('leads');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  if (checkingAuth) return null;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return <PropertiesModule />;
      case 'inquiries':
      case 'leads':
        return <ClientsModule initialSelectedId={selectedInquiryId} onInquirySelect={setSelectedInquiryId} />;
      case 'sales':
        return <SalesModule />;
      case 'rent':
        return <RentModule />;
      case 'team':
        return <TeamModule />;
      case 'testimonials':
        return <TestimonialsModule />;
      case 'partners':
        return <PartnersModule />;
      case 'cms':
        return <CMSModule />;
      case 'locations':
        return <LocationsModule />;
      case 'newsletter':
        return <SubscribersModule />;
      case 'blog':
        return <div className="p-10 text-center text-gray-500">Blog Module Coming Soon</div>;
      case 'seo':
        return <SeoManager />;
      case 'settings':
        return <SettingsModule />;
      case 'overview':
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stat Cards Section */}
            <section>
              <StatCards />
            </section>

            {/* Alert Section */}
            <section>
              <AlertBanner onInquirySelect={handleInquirySelect} />
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SalesChart />
              <GrowthChart />
            </section>

            {/* Listings and AI Suggestions Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              <ListingBoard />
              <div className="col-span-1">
                <AISuggestion onTabChange={setActiveTab} />
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <LanguageProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-white">
          {/* Fixed Sidebar */}
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

          {/* Main Content Wrapper */}
          <div className="pl-64 flex flex-col min-h-screen rtl:pl-0 rtl:pr-64 transition-all duration-300">
            <Header onInquirySelect={handleInquirySelect} onTabChange={setActiveTab} />

            <main className="p-8">
              {renderContent()}
            </main>
          </div>

          {/* Mobile Overlay */}
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8">
            <div className="bg-white p-8 rounded-3xl text-center shadow-2xl">
              <h2 className="text-2xl font-bold text-[#112922] mb-4">Desktop Experience Optimal</h2>
              <p className="text-gray-500 mb-6">Skyza Properties Admin is optimized for larger screens to handle complex real estate analytics.</p>
              <button className="bg-[#112922] text-white px-6 py-3 rounded-xl font-bold">Continue Anyway</button>
            </div>
          </div>
        </div>
      </SettingsProvider>
    </LanguageProvider>
  );
};

export default App;
