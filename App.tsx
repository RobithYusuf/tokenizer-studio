import React, { useState, createContext, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import EstimatorPage from './pages/EstimatorPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import DocumentationPage from './pages/DocumentationPage';
import Toast, { ToastType } from './components/Toast';
import { UsageLog, Model } from './types';
import { fetchModels } from './services/pricingService';

interface AppContextType {
  usageLogs: UsageLog[];
  addUsageLog: (log: Omit<UsageLog, 'id' | 'timestamp'>) => void;
  deleteUsageLog: (id: number) => void;
  showToast: (message: string, type: ToastType) => void;
  models: Model[];
  isLoadingModels: boolean;
  modelError: string | null;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'ai-token-usage-logs';

const App: React.FC = () => {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        const fetchedModels = await fetchModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error('❌ [App] Error loading models:', error);
        setModelError('Failed to load model pricing data. Please try again later.');
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usageLogs));
  }, [usageLogs]);

  const addUsageLog = useCallback((log: Omit<UsageLog, 'id' | 'timestamp'>) => {
    const newLog: UsageLog = {
      ...log,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    setUsageLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  const deleteUsageLog = useCallback((id: number) => {
    setUsageLogs(prevLogs => prevLogs.filter(log => log.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  }, []);

  return (
    <AppContext.Provider value={{ usageLogs, addUsageLog, deleteUsageLog, showToast, models, isLoadingModels, modelError }}>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<EstimatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </BrowserRouter>
    </AppContext.Provider>
  );
};

export default App;
