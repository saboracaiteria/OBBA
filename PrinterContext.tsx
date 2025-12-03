import React, { createContext, useContext, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

interface PrinterDevice {
    name: string;
    address: string;
}

interface PrinterContextType {
    devices: PrinterDevice[];
    connectedDevice: PrinterDevice | null;
    isScanning: boolean;
    scanDevices: () => Promise<void>;
    connectDevice: (device: PrinterDevice) => Promise<void>;
    disconnectDevice: () => Promise<void>;
    printText: (text: string) => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [devices, setDevices] = useState<PrinterDevice[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<PrinterDevice | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const scanDevices = async () => {
        setIsScanning(true);
        try {
            // Mock implementation - in production, you would integrate with a real Bluetooth library
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Funcionalidade de impressão disponível apenas com plugin nativo instalado.');
            setDevices([]);
        } catch (error) {
            console.error('Erro ao buscar impressoras:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const connectDevice = async (device: PrinterDevice) => {
        try {
            setConnectedDevice(device);
            await Preferences.set({ key: 'saved_printer', value: JSON.stringify(device) });
            alert(`Conectado a ${device.name}`);
        } catch (error) {
            console.error('Erro ao conectar:', error);
        }
    };

    const disconnectDevice = async () => {
        setConnectedDevice(null);
        await Preferences.remove({ key: 'saved_printer' });
    };

    const printText = async (text: string) => {
        if (!connectedDevice) {
            alert('Nenhuma impressora conectada!');
            return;
        }

        try {
            // Mock implementation
            console.log('Print Text:', text);
            alert('Funcionalidade de impressão disponível apenas com plugin nativo instalado.');
        } catch (error) {
            console.error('Erro ao imprimir:', error);
        }
    };

    return (
        <PrinterContext.Provider
            value={{
                devices,
                connectedDevice,
                isScanning,
                scanDevices,
                connectDevice,
                disconnectDevice,
                printText,
            }}
        >
            {children}
        </PrinterContext.Provider>
    );
};

export const usePrinter = () => {
    const context = useContext(PrinterContext);
    if (!context) throw new Error('usePrinter must be used within PrinterProvider');
    return context;
};
