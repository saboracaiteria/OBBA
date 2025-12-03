import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { usePrinter } from './PrinterContext';

export const PrinterSettingsPage = () => {
    const navigate = useNavigate();
    const { devices, connectedDevice, isScanning, scanDevices, connectDevice, disconnectDevice, printText } = usePrinter();

    const handleTestPrint = async () => {
        const testText =
            "[C]<b>TESTE DE IMPRESSAO</b>\n" +
            "[L]\n" +
            "[C]--------------------------------\n" +
            "[L]\n" +
            "[L]Impressora: " + (connectedDevice?.name || "Desconhecida") + "\n" +
            "[L]Data: " + new Date().toLocaleString() + "\n" +
            "[L]\n" +
            "[C]Se voce esta lendo isso,\n" +
            "[C]a configuracao esta correta!\n" +
            "[L]\n" +
            "[C]--------------------------------\n" +
            "[L]\n[L]\n";

        await printText(testText);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                <h1 className="text-xl font-bold">Configuração de Impressora</h1>
            </div>

            {/* Status Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Printer size={24} /> Status da Conexão
                </h2>

                {connectedDevice ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                            <CheckCircle size={20} />
                            <span className="font-bold">Conectado: {connectedDevice.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">{connectedDevice.address}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleTestPrint}
                                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700"
                            >
                                Imprimir Teste
                            </button>
                            <button
                                onClick={disconnectDevice}
                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200"
                            >
                                Desconectar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="text-gray-400">
                            <XCircle size={48} />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma impressora conectada</p>
                    </div>
                )}
            </div>

            {/* Scan Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Dispositivos Disponíveis</h2>
                    <button
                        onClick={scanDevices}
                        disabled={isScanning}
                        className={`p-2 rounded-full transition-all ${isScanning ? 'bg-gray-100 text-gray-400 animate-spin' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {isScanning && (
                    <p className="text-center text-gray-500 py-4">Buscando dispositivos Bluetooth...</p>
                )}

                {!isScanning && devices.length === 0 && (
                    <p className="text-center text-gray-400 py-4">Nenhum dispositivo encontrado.</p>
                )}

                <div className="space-y-2">
                    {devices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div>
                                <p className="font-bold text-gray-800">{device.name || 'Dispositivo Desconhecido'}</p>
                                <p className="text-xs text-gray-500">{device.address}</p>
                            </div>
                            <button
                                onClick={() => connectDevice(device)}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded hover:bg-black"
                            >
                                Conectar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
