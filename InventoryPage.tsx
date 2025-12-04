import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Users, ShoppingCart, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Product, Supplier, StockItem, PurchaseRecord } from './types';
import { ConfirmModal } from './ConfirmModal';
import { format } from 'date-fns';

interface InventoryPageProps {
    products: Product[];
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ products }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'stock' | 'suppliers' | 'purchases'>('stock');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier>>({});

    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [newPurchase, setNewPurchase] = useState<Partial<PurchaseRecord>>({ items: [] });
    const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number; cost: number }[]>([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, title: string, type: 'supplier' | 'purchase' } | null>(null);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        setLoading(true);
        try {
            const { data: suppliersData } = await supabase.from('suppliers').select('*');
            if (suppliersData) setSuppliers(suppliersData);

            const { data: stockData } = await supabase.from('stock_items').select('*');
            if (stockData) setStockItems(stockData);

            const { data: purchasesData } = await supabase.from('purchases').select(`
                *,
                supplier:suppliers(name)
            `).order('date', { ascending: false });

            if (purchasesData) {
                setPurchases(purchasesData.map((p: any) => ({
                    ...p,
                    supplierName: p.supplier?.name // Helper property for display
                })));
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSupplier = async () => {
        if (!editingSupplier.name) return alert('Nome é obrigatório');

        if (editingSupplier.id) {
            await supabase.from('suppliers').update(editingSupplier).eq('id', editingSupplier.id);
        } else {
            await supabase.from('suppliers').insert([editingSupplier]);
        }
        setIsSupplierModalOpen(false);
        setEditingSupplier({});
        fetchInventoryData();
    };

    const handleSavePurchase = async () => {
        if (!newPurchase.supplierId) return alert('Selecione um fornecedor');
        if (purchaseItems.length === 0) return alert('Adicione pelo menos um item');

        const total = purchaseItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

        const purchaseData = {
            supplier_id: newPurchase.supplierId,
            date: new Date().toISOString(),
            total: total,
            items: purchaseItems,
            notes: newPurchase.notes
        };

        const { error } = await supabase.from('purchases').insert([purchaseData]);

        if (error) {
            alert('Erro ao salvar compra');
            console.error(error);
            return;
        }

        // Update Stock
        for (const item of purchaseItems) {
            const currentStock = stockItems.find(s => s.productId === item.productId);
            const newQuantity = (currentStock?.quantity || 0) + item.quantity;

            if (currentStock) {
                await supabase.from('stock_items').update({ quantity: newQuantity }).eq('id', currentStock.id);
            } else {
                await supabase.from('stock_items').insert([{
                    product_id: item.productId,
                    quantity: newQuantity,
                    min_quantity: 5 // Default
                }]);
            }
        }

        setIsPurchaseModalOpen(false);
        setNewPurchase({ items: [] });
        setPurchaseItems([]);
        fetchInventoryData();
    };

    const handleDelete = async () => {
        if (!deleteConfirmation) return;

        if (deleteConfirmation.type === 'supplier') {
            await supabase.from('suppliers').delete().eq('id', deleteConfirmation.id);
        } else if (deleteConfirmation.type === 'purchase') {
            await supabase.from('purchases').delete().eq('id', deleteConfirmation.id);
        }
        setDeleteConfirmation(null);
        fetchInventoryData();
    };

    const updateStock = async (productId: string, quantity: number, minQuantity: number) => {
        const existing = stockItems.find(s => s.productId === productId);
        if (existing) {
            await supabase.from('stock_items').update({ quantity, min_quantity: minQuantity }).eq('id', existing.id);
        } else {
            await supabase.from('stock_items').insert([{ product_id: productId, quantity, min_quantity: minQuantity }]);
        }
        fetchInventoryData();
    };

    // Helper for Purchase Modal
    const addPurchaseItem = () => {
        setPurchaseItems([...purchaseItems, { productId: products[0]?.id || '', quantity: 1, cost: 0 }]);
    };

    const updatePurchaseItem = (index: number, field: keyof typeof purchaseItems[0], value: any) => {
        const newItems = [...purchaseItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPurchaseItems(newItems);
    };

    const removePurchaseItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                    <h1 className="text-xl font-bold">Controle de Estoque</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'stock' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                    <Package size={20} /> Estoque Atual
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'suppliers' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                    <Users size={20} /> Fornecedores
                </button>
                <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'purchases' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                    <ShoppingCart size={20} /> Compras
                </button>
            </div>

            {/* Content */}
            {activeTab === 'stock' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Níveis de Estoque</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Produto</th>
                                    <th className="p-3 text-center">Atual</th>
                                    <th className="p-3 text-center">Mínimo</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(product => {
                                    const stock = stockItems.find(s => s.productId === product.id);
                                    const quantity = stock?.quantity || 0;
                                    const minQuantity = stock?.minQuantity || 5;
                                    const status = quantity <= 0 ? 'critical' : quantity <= minQuantity ? 'low' : 'ok';

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium">{product.name}</td>
                                            <td className="p-3 text-center font-bold text-lg">{quantity}</td>
                                            <td className="p-3 text-center text-gray-500">{minQuantity}</td>
                                            <td className="p-3 text-center">
                                                {status === 'critical' && <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">ESGOTADO</span>}
                                                {status === 'low' && <span className="text-orange-600 font-bold text-xs bg-orange-100 px-2 py-1 rounded">BAIXO</span>}
                                                {status === 'ok' && <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">OK</span>}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        const newQty = prompt('Nova quantidade:', quantity.toString());
                                                        if (newQty !== null) updateStock(product.id, parseInt(newQty), minQuantity);
                                                    }}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded font-bold text-xs"
                                                >
                                                    AJUSTAR
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'suppliers' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setEditingSupplier({}); setIsSupplierModalOpen(true); }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Plus size={20} /> Novo Fornecedor
                        </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {suppliers.map(supplier => (
                            <div key={supplier.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800">{supplier.name}</h3>
                                    <p className="text-sm text-gray-600">{supplier.contact}</p>
                                    <p className="text-sm text-gray-500">{supplier.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingSupplier(supplier); setIsSupplierModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                    <button onClick={() => setDeleteConfirmation({ id: supplier.id, title: supplier.name, type: 'supplier' })} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setNewPurchase({}); setPurchaseItems([]); setIsPurchaseModalOpen(true); }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Plus size={20} /> Nova Compra
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Fornecedor</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases.map(purchase => (
                                    <tr key={purchase.id} className="hover:bg-gray-50">
                                        <td className="p-3">{format(new Date(purchase.date), 'dd/MM/yy HH:mm')}</td>
                                        <td className="p-3">{(purchase as any).supplierName || '---'}</td>
                                        <td className="p-3 text-right font-bold">R$ {purchase.total.toFixed(2)}</td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => setDeleteConfirmation({ id: purchase.id, title: `Compra de ${format(new Date(purchase.date), 'dd/MM')}`, type: 'purchase' })}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
                        <h3 className="font-bold text-lg">{editingSupplier.id ? 'Editar' : 'Novo'} Fornecedor</h3>
                        <input className="w-full border p-3 rounded" placeholder="Nome da Empresa" value={editingSupplier.name || ''} onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })} />
                        <input className="w-full border p-3 rounded" placeholder="Nome do Contato" value={editingSupplier.contact || ''} onChange={e => setEditingSupplier({ ...editingSupplier, contact: e.target.value })} />
                        <input className="w-full border p-3 rounded" placeholder="Telefone / WhatsApp" value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} />
                        <button onClick={handleSaveSupplier} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Salvar</button>
                        <button onClick={() => setIsSupplierModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                    </div>
                </div>
            )}

            {isPurchaseModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 my-8">
                        <h3 className="font-bold text-lg">Registrar Compra</h3>

                        <select
                            className="w-full border p-3 rounded"
                            value={newPurchase.supplierId || ''}
                            onChange={e => setNewPurchase({ ...newPurchase, supplierId: e.target.value })}
                        >
                            <option value="">Selecione o Fornecedor</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm">Itens</span>
                                <button onClick={addPurchaseItem} className="text-purple-600 text-sm font-bold flex items-center gap-1"><Plus size={14} /> Adicionar Item</button>
                            </div>
                            {purchaseItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                                    <select
                                        className="flex-1 border p-1 rounded text-sm"
                                        value={item.productId}
                                        onChange={e => updatePurchaseItem(idx, 'productId', e.target.value)}
                                    >
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        className="w-16 border p-1 rounded text-sm"
                                        placeholder="Qtd"
                                        value={item.quantity}
                                        onChange={e => updatePurchaseItem(idx, 'quantity', parseInt(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        className="w-20 border p-1 rounded text-sm"
                                        placeholder="Custo"
                                        step="0.01"
                                        value={item.cost}
                                        onChange={e => updatePurchaseItem(idx, 'cost', parseFloat(e.target.value))}
                                    />
                                    <button onClick={() => removePurchaseItem(idx)} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>R$ {purchaseItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0).toFixed(2)}</span>
                        </div>

                        <textarea
                            className="w-full border p-3 rounded"
                            placeholder="Observações"
                            rows={2}
                            value={newPurchase.notes || ''}
                            onChange={e => setNewPurchase({ ...newPurchase, notes: e.target.value })}
                        />

                        <button onClick={handleSavePurchase} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Salvar Compra</button>
                        <button onClick={() => setIsPurchaseModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirmation}
                title={`Excluir ${deleteConfirmation?.type === 'supplier' ? 'Fornecedor' : 'Compra'}`}
                message={`Tem certeza que deseja excluir "${deleteConfirmation?.title}"?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmation(null)}
                isDestructive
                confirmText="Excluir"
            />
        </div>
    );
};
