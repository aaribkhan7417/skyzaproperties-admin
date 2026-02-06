import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminSettings } from '../api';

interface SettingsContextType {
    settings: any;
    refreshSettings: () => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const response = await getAdminSettings();
            if (response.status === 'success') {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, refreshSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
