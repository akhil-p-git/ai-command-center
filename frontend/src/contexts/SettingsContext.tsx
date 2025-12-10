import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

export interface Settings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  environment: 'dev' | 'prod';
  features: {
    enableStreaming: boolean;
    showTokenCosts: boolean;
    debugMode: boolean;
  };
}

const defaultSettings: Settings = {
  apiKey: '',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 1024,
  environment: 'dev',
  features: {
    enableStreaming: false,
    showTokenCosts: true,
    debugMode: false
  }
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  updateFeature: (key: keyof Settings['features'], value: boolean) => void;
  clearSettings: () => void;
  hasApiKey: boolean;
  
  // Legacy accessors compatibility (can be removed later if we update all consumers)
  environment: 'dev' | 'prod';
  setEnvironment: (env: 'dev' | 'prod') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load from storage on mount
  useEffect(() => {
    const savedSettings = storage.get<Settings>('app_settings', defaultSettings);
    // Merge with default to handle new fields in future
    setSettings({ 
      ...defaultSettings, 
      ...savedSettings, 
      features: { ...defaultSettings.features, ...savedSettings.features }
    });
  }, []);

  // Save to storage on change
  useEffect(() => {
    storage.set('app_settings', settings);
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const updateFeature = (key: keyof Settings['features'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  const clearSettings = () => {
    setSettings(defaultSettings);
    storage.remove('app_settings');
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        updateFeature,
        clearSettings,
        hasApiKey: !!settings.apiKey,
        
        // Legacy shims
        environment: settings.environment,
        setEnvironment: (env) => updateSettings({ environment: env }),
        apiKey: settings.apiKey,
        setApiKey: (key) => updateSettings({ apiKey: key }),
        model: settings.model,
        setModel: (model) => updateSettings({ model }),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
