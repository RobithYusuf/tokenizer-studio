import React, { useState, createContext, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import EstimatorPage from './pages/EstimatorPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import DocumentationPage from './pages/DocumentationPage';
import VolumeSimulatorPage from './pages/VolumeSimulatorPageV2';
import Toast, { ToastType } from './components/Toast';
import { UsageLog, Model } from './types';
import { fetchModels } from './services/pricingService';
import { openRouterService, NormalizedModel } from './services/openRouterService';
import { aimlApiService, NormalizedAIMLModel } from './services/aimlApiService';
import { heliconeService, NormalizedHeliconeModel } from './services/heliconeService';

interface AppContextType {
  usageLogs: UsageLog[];
  addUsageLog: (log: Omit<UsageLog, 'id' | 'timestamp'>) => void;
  deleteUsageLog: (id: number) => void;
  showToast: (message: string, type: ToastType) => void;
  // ArtificialAnalysis models (for PricingPage)
  models: Model[];
  isLoadingModels: boolean;
  modelError: string | null;
  // OpenRouter models (for Simulator)
  openRouterModels: NormalizedModel[];
  isLoadingOpenRouter: boolean;
  openRouterError: string | null;
  // AIML API models (for PricingPage - multimodal)
  aimlApiModels: NormalizedAIMLModel[];
  isLoadingAIML: boolean;
  aimlError: string | null;
  // Helicone models (for PricingPage - open source pricing data)
  heliconeModels: NormalizedHeliconeModel[];
  isLoadingHelicone: boolean;
  heliconeError: string | null;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'ai-token-usage-logs';

const App: React.FC = () => {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  // ArtificialAnalysis models (for PricingPage)
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // OpenRouter models (for Simulator)
  const [openRouterModels, setOpenRouterModels] = useState<NormalizedModel[]>([]);
  const [isLoadingOpenRouter, setIsLoadingOpenRouter] = useState<boolean>(true);
  const [openRouterError, setOpenRouterError] = useState<string | null>(null);

  // AIML API models (for PricingPage - multimodal)
  const [aimlApiModels, setAimlApiModels] = useState<NormalizedAIMLModel[]>([]);
  const [isLoadingAIML, setIsLoadingAIML] = useState<boolean>(true);
  const [aimlError, setAimlError] = useState<string | null>(null);

  // Helicone models (for PricingPage - open source)
  const [heliconeModels, setHeliconeModels] = useState<NormalizedHeliconeModel[]>([]);
  const [isLoadingHelicone, setIsLoadingHelicone] = useState<boolean>(true);
  const [heliconeError, setHeliconeError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  // Load ArtificialAnalysis models for PricingPage
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        const fetchedModels = await fetchModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error('❌ [App] Error loading ArtificialAnalysis models:', error);
        setModelError('Failed to load model pricing data. Please try again later.');
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  // Load OpenRouter models for Simulator
  useEffect(() => {
    const loadOpenRouterModels = async () => {
      try {
        setIsLoadingOpenRouter(true);
        const fetchedModels = await openRouterService.fetchModels();
        setOpenRouterModels(fetchedModels);
      } catch (error) {
        console.error('❌ [App] Error loading OpenRouter models:', error);
        setOpenRouterError('Failed to load OpenRouter models. Please try again later.');
      } finally {
        setIsLoadingOpenRouter(false);
      }
    };
    loadOpenRouterModels();
  }, []);

  // Load AIML API models for PricingPage (multimodal)
  useEffect(() => {
    const loadAIMLModels = async () => {
      try {
        setIsLoadingAIML(true);
        const fetchedModels = await aimlApiService.fetchModels();
        setAimlApiModels(fetchedModels);
      } catch (error) {
        console.error('❌ [App] Error loading AIML API models:', error);
        setAimlError('Failed to load AIML API models. Please try again later.');
      } finally {
        setIsLoadingAIML(false);
      }
    };
    loadAIMLModels();
  }, []);

  // Load Helicone models for PricingPage (open source)
  useEffect(() => {
    const loadHeliconeModels = async () => {
      try {
        setIsLoadingHelicone(true);
        const fetchedModels = await heliconeService.fetchModels();
        setHeliconeModels(fetchedModels);
      } catch (error) {
        console.error('❌ [App] Error loading Helicone models:', error);
        setHeliconeError('Failed to load Helicone models. Please try again later.');
      } finally {
        setIsLoadingHelicone(false);
      }
    };
    loadHeliconeModels();
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
    <AppContext.Provider value={{
      usageLogs,
      addUsageLog,
      deleteUsageLog,
      showToast,
      models,
      isLoadingModels,
      modelError,
      openRouterModels,
      isLoadingOpenRouter,
      openRouterError,
      aimlApiModels,
      isLoadingAIML,
      aimlError,
      heliconeModels,
      isLoadingHelicone,
      heliconeError
    }}>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<EstimatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/simulator" element={<VolumeSimulatorPage />} />
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
