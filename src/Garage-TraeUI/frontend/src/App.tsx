import { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Key, 
  BarChart3, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { apiClient } from './lib/api';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import ClusterView from './components/ClusterView';
import BucketsView from './components/BucketsView';
import KeysView from './components/KeysView';
import MetricsView from './components/MetricsView';
import SettingsView from './components/SettingsView';
import ErrorBoundary from './components/ErrorBoundary';

type View = 'dashboard' | 'cluster' | 'buckets' | 'keys' | 'metrics' | 'settings';

interface ConnectionStatus {
  connected: boolean;
  authenticated: boolean;
  loading: boolean;
  error?: string;
}

/**
 * Garage-TraeUI - A modern web interface for Garage S3-compatible storage
 * 
 * This code was developed autonomously by TRAE in "SOLO" mode.
 * Copyright holder: Federico Giampietro
 * 
 * Licensed under Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)
 * 
 * You are free to:
 * - Share: copy and redistribute the material in any medium or format
 * - Adapt: remix, transform, and build upon the material
 * 
 * Under the following terms:
 * - Attribution: You must give appropriate credit, provide a link to the license,
 *   and indicate if changes were made.
 * - NonCommercial: You may not use the material for commercial purposes without
 *   explicit written permission from the copyright holder.
 * 
 * This software is provided "AS IS", without warranty of any kind, express or implied.
 * 
 * This subproject is part of the LSSA Project (https://github.com/iz0eyj/LSSA).
 */

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    authenticated: false,
    loading: true
  });

  // Test connessione all'avvio
  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus(prev => ({ ...prev, loading: true }));
        
        // Test connessione
        const connectionResult = await apiClient.testConnection();
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Connessione fallita');
        }

        // Test autenticazione
        const authResult = await apiClient.testAuth();
        if (!authResult.success) {
          throw new Error(authResult.error || 'Autenticazione fallita');
        }

        setConnectionStatus({
          connected: true,
          authenticated: true,
          loading: false
        });
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus({
          connected: false,
          authenticated: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Errore di connessione'
        });
      }
    };

    testConnection();
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'cluster', name: 'Cluster', icon: Server },
    { id: 'buckets', name: 'Bucket', icon: Database },
    { id: 'keys', name: 'Chiavi', icon: Key },
    { id: 'metrics', name: 'Metriche', icon: BarChart3 },
    { id: 'settings', name: 'Impostazioni', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'cluster':
        return <ClusterView />;
      case 'buckets':
        return (
          <ErrorBoundary>
            <BucketsView />
          </ErrorBoundary>
        );
      case 'keys':
        return (
          <ErrorBoundary>
            <KeysView />
          </ErrorBoundary>
        );
      case 'metrics':
        return <MetricsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  if (connectionStatus.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connessione a Garage</h2>
          <p className="text-gray-600">Verifica della connessione in corso...</p>
        </div>
      </div>
    );
  }

  if (!connectionStatus.connected || !connectionStatus.authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connessione Fallita</h2>
            <p className="text-gray-600 mb-4">
              {connectionStatus.error || 'Impossibile connettersi al server Garage'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-4 py-2"
            >
              Riprova
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Informazioni di Debug</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <div>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</div>
              <div>Connesso: {connectionStatus.connected ? 'Sì' : 'No'}</div>
              <div>Autenticato: {connectionStatus.authenticated ? 'Sì' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-white shadow-sm border-r border-gray-200 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Garage-TraeUI</h1>
                  <p className="text-xs text-gray-500">Console di Amministrazione</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary-600" : "text-gray-400"
                  )} />
                  {sidebarOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* Status */}
          <div className="p-4 border-t border-gray-200">
            <div className={cn(
              "flex items-center space-x-2 text-sm",
              sidebarOpen ? "" : "justify-center"
            )}>
              {connectionStatus.connected ? (
                <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-danger-500 flex-shrink-0" />
              )}
              {sidebarOpen && (
                <div>
                  <div className="text-gray-900 font-medium">
                    {connectionStatus.connected ? 'Connesso' : 'Disconnesso'}
                  </div>
                  <div className="text-gray-500 text-xs">Garage S3 Server</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentView === 'dashboard' ? 'Dashboard' : 
                 currentView === 'cluster' ? 'Gestione Cluster' :
                 currentView === 'buckets' ? 'Gestione Bucket' :
                 currentView === 'keys' ? 'Chiavi di Accesso' :
                 currentView === 'metrics' ? 'Metriche e Monitoraggio' :
                 'Impostazioni'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentView === 'dashboard' ? 'Panoramica generale del sistema' :
                 currentView === 'cluster' ? 'Stato e configurazione del cluster' :
                 currentView === 'buckets' ? 'Gestione bucket S3 e oggetti' :
                 currentView === 'keys' ? 'Gestione chiavi di accesso e permessi' :
                 currentView === 'metrics' ? 'Monitoraggio prestazioni e metriche' :
                 'Configurazione e impostazioni sistema'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {connectionStatus.connected ? (
                  <>
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;