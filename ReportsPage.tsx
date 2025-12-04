import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart2, DollarSign, FileText, Printer, Calendar, Search, Filter } from 'lucide-react';
import { usePrinter } from './PrinterContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderRecord {
    id: string;
    date: string;
    total: number;
    paymentMethod: string;
    status: string;
}

interface ReportsPageProps {
    orders: OrderRecord[];
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ReportsPage: React.FC<ReportsPageProps> = ({ orders }) => {
    const navigate = useNavigate();
    const { printText, connectedDevice } = usePrinter();

    // Date State
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Filter Logic
    const filteredOrders = useMemo(() => {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return isWithinInterval(orderDate, { start, end });
        });
    }, [orders, startDate, endDate]);

    // Statistics Calculation
    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filteredOrders.length;

        // Payment Methods
        const paymentStats = filteredOrders.reduce((acc, order) => {
            const method = order.paymentMethod;
            if (!acc[method]) acc[method] = { name: method, value: 0 };
            acc[method].value += order.total;
            return acc;
        }, {} as Record<string, { name: string; value: number }>);

        // Daily Sales for Chart
        const salesByDate = filteredOrders.reduce((acc, order) => {
            const dateKey = format(new Date(order.date), 'dd/MM');
            if (!acc[dateKey]) acc[dateKey] = { name: dateKey, total: 0, count: 0 };
            acc[dateKey].total += order.total;
            acc[dateKey].count += 1;
            return acc;
        }, {} as Record<string, { name: string; total: number; count: number }>);

        // Sort by date (simple approach assuming keys are sortable or data comes sorted, 
        // but for robustness we might need better sorting if spanning years/months)
        // Since keys are dd/MM, sorting might be tricky if spanning years. 
        // Better to sort by timestamp then map.
        const sortedSales = Object.values(salesByDate).sort((a, b) => {
            // This is a simplification. For correct sorting we'd need the full date in the key.
            // But for display we use dd/MM. 
            // Let's rely on the fact that we iterate filteredOrders which might be sorted? 
            // No, let's re-sort based on the original data order if possible or just accept this for now.
            return 0;
        });

        // Re-doing chart data generation to ensure order
        const chartDataMap = new Map();
        filteredOrders.forEach(order => {
            const d = new Date(order.date);
            const key = format(d, 'dd/MM');
            const sortKey = d.getTime(); // Use timestamp for sorting

            // We need to bucket by day.
            const dayStart = startOfDay(d).getTime();
            const dayKey = format(d, 'dd/MM');

            if (!chartDataMap.has(dayStart)) {
                chartDataMap.set(dayStart, { name: dayKey, total: 0, count: 0, timestamp: dayStart });
            }
            const entry = chartDataMap.get(dayStart);
            entry.total += order.total;
            entry.count += 1;
        });

        const chartData = Array.from(chartDataMap.values())
            .sort((a, b) => a.timestamp - b.timestamp);

        return {
            totalRevenue,
            totalOrders,
            paymentData: Object.values(paymentStats),
            chartData
        };
    }, [filteredOrders]);

    const handleQuickFilter = (type: 'today' | 'week' | 'month') => {
        const today = new Date();
        if (type === 'today') {
            setStartDate(format(today, 'yyyy-MM-dd'));
            setEndDate(format(today, 'yyyy-MM-dd'));
        } else if (type === 'week') {
            setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
            setEndDate(format(today, 'yyyy-MM-dd'));
        } else if (type === 'month') {
            setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
            setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        }
    };

    const handlePrint = async () => {
        if (!connectedDevice) return alert('Conecte uma impressora!');

        const report =
            "[C]<b>RELATORIO FINANCEIRO</b>\n" +
            "[L]\n" +
            `[L]Periodo: ${format(parseISO(startDate), 'dd/MM/yy')} - ${format(parseISO(endDate), 'dd/MM/yy')}\n` +
            `[L]Gerado em: ${format(new Date(), 'dd/MM/yy HH:mm')}\n` +
            "[L]--------------------------------\n" +
            "[L]<b>RESUMO</b>\n" +
            `[L]Receita Total: ${formatCurrency(stats.totalRevenue)}\n` +
            `[L]Total Pedidos: ${stats.totalOrders}\n` +
            `[L]Ticket Medio: ${formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}\n` +
            "[L]--------------------------------\n" +
            "[L]<b>PAGAMENTOS</b>\n" +
            stats.paymentData.map(p => `[L]${p.name}: ${formatCurrency(p.value)}`).join('\n') + "\n" +
            "[L]--------------------------------\n" +
            "[L]\n[L]\n[L]\n";

        await printText(report);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 14, 22);

        doc.setFontSize(11);
        doc.text(`Período: ${format(parseISO(startDate), 'dd/MM/yy')} - ${format(parseISO(endDate), 'dd/MM/yy')}`, 14, 30);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yy HH:mm')}`, 14, 36);

        // Summary
        doc.text('Resumo:', 14, 45);
        doc.text(`Receita Total: ${formatCurrency(stats.totalRevenue)}`, 14, 51);
        doc.text(`Total Pedidos: ${stats.totalOrders}`, 14, 57);
        doc.text(`Ticket Médio: ${formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}`, 14, 63);

        // Table
        const tableColumn = ["Data", "Pedido", "Pagamento", "Status", "Valor"];
        const tableRows = filteredOrders.map(order => [
            format(new Date(order.date), 'dd/MM/yy HH:mm'),
            `#${order.id}`,
            order.paymentMethod,
            order.status,
            formatCurrency(order.total)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
        });

        doc.save(`relatorio_financeiro_${startDate}_${endDate}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                    <h1 className="text-xl font-bold text-gray-800">Relatórios Financeiros</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <Printer size={20} /> Imprimir
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <FileText size={20} /> PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Inicial</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="border p-2 rounded-lg w-full md:w-auto focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Final</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="border p-2 rounded-lg w-full md:w-auto focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button onClick={() => handleQuickFilter('today')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium whitespace-nowrap">Hoje</button>
                        <button onClick={() => handleQuickFilter('week')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium whitespace-nowrap">7 Dias</button>
                        <button onClick={() => handleQuickFilter('month')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium whitespace-nowrap">Este Mês</button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Receita Total</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total de Pedidos</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FileText size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Ticket Médio</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <BarChart2 size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sales Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Evolução de Vendas</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                                    labelStyle={{ color: '#333' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Formas de Pagamento</h3>
                    <div className="h-64 w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed List (Optional, maybe just top items or recent orders in period) */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Detalhamento do Período</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-3">Data</th>
                                <th className="p-3">Pedido</th>
                                <th className="p-3">Pagamento</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum pedido neste período</td>
                                </tr>
                            ) : (
                                filteredOrders.slice(0, 50).map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="p-3">{format(new Date(order.date), 'dd/MM/yy HH:mm')}</td>
                                        <td className="p-3 font-medium">#{order.id}</td>
                                        <td className="p-3">{order.paymentMethod}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(order.total)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length > 50 && (
                    <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-100">
                        Exibindo os últimos 50 pedidos de {filteredOrders.length}
                    </div>
                )}
            </div>
        </div>
    );
};
