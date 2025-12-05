import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, Trash2, Upload, Loader2, Save, X, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from './supabaseClient';
import { ConfirmModal } from './ConfirmModal';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    categoryId: string;
    groupIds?: string[];
    displayOrder?: number;
    active?: boolean;
}

interface Category {
    id: string;
    title: string;
    icon?: string;
}

interface ProductGroup {
    id: string;
    title: string;
    icon?: string;
}

interface ProductsPageProps {
    products: Product[];
    categories: Category[];
    groups: ProductGroup[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    reorderProducts: (categoryId: string, products: Product[]) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
    products,
    categories,
    groups,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [inlineEditId, setInlineEditId] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<Partial<Product>>({});
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, name: string } | null>(null);
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
    const [dragOverProduct, setDragOverProduct] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setSelectedGroups(product.groupIds || []);
        } else {
            setEditingProduct({ categoryId: categories[0]?.id || '' });
            setSelectedGroups([]);
        }
        setIsModalOpen(true);
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const publicUrl = await uploadImageToSupabase(e.target.files[0]);
            if (publicUrl) {
                setEditingProduct({ ...editingProduct, image: publicUrl });
            }
        }
    };

    const handleSave = () => {
        if (!editingProduct.name || !editingProduct.price || !editingProduct.categoryId) {
            return alert('Preencha nome, preço e categoria');
        }

        const productData = {
            ...editingProduct,
            groupIds: selectedGroups.length > 0 ? selectedGroups : undefined
        } as Product;

        if (editingProduct.id) {
            updateProduct(productData);
        } else {
            addProduct({ ...productData, id: crypto.randomUUID() });
        }
        setIsModalOpen(false);
        setEditingProduct({});
        setSelectedGroups([]);
    };

    const toggleGroup = (groupId: string) => {
        if (selectedGroups.includes(groupId)) {
            setSelectedGroups(selectedGroups.filter(g => g !== groupId));
        } else {
            setSelectedGroups([...selectedGroups, groupId]);
        }
    };

    const handleInlineEdit = (product: Product) => {
        setInlineEditId(product.id);
        setInlineEditData({ ...product });
    };

    const handleInlineSave = () => {
        if (!inlineEditData.name || !inlineEditData.price) {
            alert('Preencha nome e preço');
            return;
        }
        updateProduct(inlineEditData as Product);
        setInlineEditId(null);
        setInlineEditData({});
    };

    const handleInlineCancel = () => {
        setInlineEditId(null);
        setInlineEditData({});
    };

    const handleToggleActive = async (product: Product) => {
        const newActive = !(product.active ?? true);
        // Optimistic update via updateProduct
        updateProduct({ ...product, active: newActive });
        // Persist to Supabase
        await supabase.from('products').update({ active: newActive }).eq('id', product.id);
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, product: Product) => {
        setDraggedProduct(product);
        e.dataTransfer.effectAllowed = 'move';
        // Add drag styling
        const target = e.target as HTMLElement;
        setTimeout(() => {
            target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedProduct(null);
        setDragOverProduct(null);
    };

    const handleDragOver = (e: React.DragEvent, productId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedProduct && draggedProduct.id !== productId) {
            setDragOverProduct(productId);
        }
    };

    const handleDragLeave = () => {
        setDragOverProduct(null);
    };

    const handleDrop = (e: React.DragEvent, targetProduct: Product) => {
        e.preventDefault();

        if (!draggedProduct || draggedProduct.id === targetProduct.id) {
            setDragOverProduct(null);
            return;
        }

        // Only allow reordering within same category
        if (draggedProduct.categoryId !== targetProduct.categoryId) {
            alert('Só é possível reordenar produtos dentro da mesma categoria');
            setDragOverProduct(null);
            return;
        }

        // Get products in this category and reorder
        const categoryProducts = products
            .filter(p => p.categoryId === draggedProduct.categoryId)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        const draggedIndex = categoryProducts.findIndex(p => p.id === draggedProduct.id);
        const targetIndex = categoryProducts.findIndex(p => p.id === targetProduct.id);

        // Remove dragged product and insert at new position
        const reorderedProducts = [...categoryProducts];
        const [removed] = reorderedProducts.splice(draggedIndex, 1);
        reorderedProducts.splice(targetIndex, 0, removed);

        // Update display order for all products in category
        const updatedProducts = reorderedProducts.map((p, idx) => ({
            ...p,
            displayOrder: idx
        }));

        reorderProducts(draggedProduct.categoryId, updatedProducts);
        setDragOverProduct(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                    <h1 className="text-xl font-bold">Produtos</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={20} /> Novo
                </button>
            </div>

            {categories.map(category => {
                const categoryProducts = products
                    .filter(p => p.categoryId === category.id)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                if (categoryProducts.length === 0) return null;

                return (
                    <div key={category.id} className="mb-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                            {category.icon} {category.title}
                        </h2>
                        <div className="space-y-2">
                            {categoryProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`bg-white p-3 rounded-lg shadow-sm transition-all duration-200 ${dragOverProduct === product.id
                                        ? 'border-2 border-purple-500 border-dashed bg-purple-50'
                                        : 'border-2 border-transparent'
                                        } ${draggedProduct?.id === product.id ? 'opacity-50' : ''}`}
                                    draggable={inlineEditId !== product.id}
                                    onDragStart={(e) => handleDragStart(e, product)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, product.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, product)}
                                >
                                    {inlineEditId === product.id ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-3 items-start">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        className="w-full border p-2 rounded font-bold"
                                                        placeholder="Nome do Produto"
                                                        value={inlineEditData.name || ''}
                                                        onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })}
                                                        autoFocus
                                                    />
                                                    <input
                                                        className="w-full border p-2 rounded text-sm"
                                                        placeholder="Descrição"
                                                        value={inlineEditData.description || ''}
                                                        onChange={e => setInlineEditData({ ...inlineEditData, description: e.target.value })}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full border p-2 rounded font-bold text-green-600"
                                                        placeholder="Preço"
                                                        value={inlineEditData.price || ''}
                                                        onChange={e => setInlineEditData({ ...inlineEditData, price: parseFloat(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={handleInlineSave}
                                                    className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-bold flex items-center gap-1 transition-colors"
                                                >
                                                    <Save size={16} /> Salvar
                                                </button>
                                                <button
                                                    onClick={handleInlineCancel}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded font-bold flex items-center gap-1"
                                                >
                                                    <X size={16} /> Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            {/* Drag Handle */}
                                            <div
                                                className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
                                                title="Arraste para reordenar"
                                            >
                                                <GripVertical size={20} />
                                            </div>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={`w-16 h-16 rounded object-cover ${(product.active ?? true) ? '' : 'opacity-40 grayscale'}`}
                                            />
                                            <div className={`flex-1 ${(product.active ?? true) ? '' : 'opacity-50'}`}>
                                                <p className="font-bold">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.description}</p>
                                                <p className="text-green-600 font-bold">R$ {product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {/* Toggle Active/Inactive */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(product); }}
                                                    className={`p-2 rounded transition-colors ${(product.active ?? true) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={(product.active ?? true) ? 'Desativar Produto' : 'Ativar Produto'}
                                                >
                                                    {(product.active ?? true) ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                                </button>
                                                <button
                                                    onClick={() => handleInlineEdit(product)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    title="Editar Rápido"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Editar Completo"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmation({ id: product.id, name: product.name })}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Deletar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 my-8">
                        <h3 className="font-bold text-lg">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h3>

                        {/* Image Upload */}
                        <div>
                            {editingProduct.image && (
                                <div className="relative mb-2">
                                    <img src={editingProduct.image} className="w-full h-40 object-cover rounded" alt="Preview" />
                                    <button
                                        onClick={() => {
                                            if (confirm('Remover esta imagem?')) {
                                                setEditingProduct({ ...editingProduct, image: '' });
                                            }
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            <label className={`w-full cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded border border-dashed flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                <span className="text-sm">
                                    {isUploading ? 'Enviando...' : (editingProduct.image ? 'Alterar Imagem' : 'Adicionar Imagem')}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        <input
                            className="w-full border p-3 rounded"
                            placeholder="Nome do Produto"
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />

                        <textarea
                            className="w-full border p-3 rounded"
                            placeholder="Descrição (opcional)"
                            rows={2}
                            value={editingProduct.description || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        />

                        <input
                            type="number"
                            step="0.01"
                            className="w-full border p-3 rounded"
                            placeholder="Preço (R$)"
                            value={editingProduct.price || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        />

                        <select
                            className="w-full border p-3 rounded"
                            value={editingProduct.categoryId || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                        >
                            <option value="">Selecione a Categoria</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.title}</option>
                            ))}
                        </select>

                        {/* Groups/Addons Selection */}
                        {groups.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Adicionais (opcional)</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                                    {groups.map(group => (
                                        <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(group.id)}
                                                onChange={() => toggleGroup(group.id)}
                                            />
                                            <span className="text-sm">{group.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={isUploading}
                            className={`w-full bg-purple-600 text-white py-3 rounded-lg font-bold ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? 'Aguarde...' : 'Salvar Produto'}
                        </button>
                        <button
                            onClick={() => { setIsModalOpen(false); setEditingProduct({}); setSelectedGroups([]); }}
                            className="w-full text-gray-500 py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirmation}
                title="Excluir Produto"
                message={`Tem certeza que deseja excluir "${deleteConfirmation?.name}"?`}
                onConfirm={() => {
                    if (deleteConfirmation) {
                        deleteProduct(deleteConfirmation.id);
                        setDeleteConfirmation(null);
                    }
                }}
                onCancel={() => setDeleteConfirmation(null)}
                isDestructive
                confirmText="Excluir"
            />
        </div>
    );
};
