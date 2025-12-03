import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { migrateDataToSupabase, validateSupabaseConnection } from './migrateToSupabase';

/**
 * Componente temporário para testar conexão e migrar dados
 * Use este componente uma vez para transferir dados do storage local para Supabase
 */
export const TestSupabaseConnection = () => {
    const [status, setStatus] = useState<'idle' | 'testing' | 'migrating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (log: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${log}`]);
        console.log(log);
    };

    const testConnection = async () => {
        setStatus('testing');
        setMessage('Testando conexão...');
        addLog('🔍 Iniciando teste de conexão com Supabase...');

        const connected = await validateSupabaseConnection();

        if (connected) {
            addLog('✅ Conexão estabelecida com sucesso!');
            setMessage('Conexão OK! Pronto para migrar dados.');
            setStatus('idle');
            return true;
        } else {
            addLog('❌ Falha na conexão');
            setMessage('Erro: Verifique as credenciais no .env.local');
            setStatus('error');
            return false;
        }
    };

    const runMigration = async () => {
        setStatus('migrating');
        setMessage('Migrando dados... (isso pode levar alguns minutos)');
        addLog('🚀 Iniciando migração de dados...');

        try {
            // Interceptar console.log para mostrar na UI
            const originalLog = console.log;
            console.log = (...args) => {
                addLog(args.join(' '));
                originalLog(...args);
            };

            const result = await migrateDataToSupabase();

            console.log = originalLog;

            if (result.success) {
                addLog('✅ Migração concluída com sucesso!');
                setMessage('✅ Todos os dados foram migrados para o Supabase!');
                setStatus('success');
            } else {
                addLog('❌ Erro durante a migração');
                setMessage('❌ Erro durante a migração. Verifique o console.');
                setStatus('error');
            }
        } catch (error) {
            addLog(`❌ Erro: ${error}`);
            setMessage('❌ Erro durante a migração');
            setStatus('error');
        }
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '50px auto',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: '#4E0797', marginBottom: '20px' }}>🔧 Teste de Conexão Supabase</h1>

            <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    Este painel permite testar a conexão com o Supabase e migrar seus dados locais.
                </p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    <strong>⚠️ Importante:</strong> Execute a migração apenas UMA VEZ!
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={testConnection}
                    disabled={status === 'testing' || status === 'migrating'}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#4E0797',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: status === 'testing' || status === 'migrating' ? 'not-allowed' : 'pointer',
                        opacity: status === 'testing' || status === 'migrating' ? 0.5 : 1,
                        fontWeight: 'bold'
                    }}
                >
                    {status === 'testing' ? '⏳ Testando...' : '🔍 Testar Conexão'}
                </button>

                <button
                    onClick={runMigration}
                    disabled={status === 'testing' || status === 'migrating' || status === 'success'}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: status === 'testing' || status === 'migrating' || status === 'success' ? 'not-allowed' : 'pointer',
                        opacity: status === 'testing' || status === 'migrating' || status === 'success' ? 0.5 : 1,
                        fontWeight: 'bold'
                    }}
                >
                    {status === 'migrating' ? '⏳ Migrando...' : status === 'success' ? '✅ Migrado!' : '🚀 Migrar Dados'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '15px',
                    backgroundColor: status === 'error' ? '#fee' : status === 'success' ? '#efe' : '#e3f2fd',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: status === 'error' ? '#c00' : status === 'success' ? '#060' : '#0277bd'
                }}>
                    {message}
                </div>
            )}

            {logs.length > 0 && (
                <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}>
                    <h3 style={{ marginTop: 0, fontSize: '14px', color: '#333' }}>📋 Logs:</h3>
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '5px', color: '#333' }}>
                            {log}
                        </div>
                    ))}
                </div>
            )}

            {status === 'success' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                    <h3 style={{ color: '#155724', marginTop: 0 }}>🎉 Próximos Passos:</h3>
                    <ol style={{ color: '#155724', marginBottom: 0 }}>
                        <li>Verifique os dados no Supabase Dashboard (Table Editor)</li>
                        <li>Me avise que a migração foi concluída</li>
                        <li>Vou atualizar o App.tsx para usar Supabase permanentemente</li>
                    </ol>
                </div>
            )}
        </div>
    );
};
