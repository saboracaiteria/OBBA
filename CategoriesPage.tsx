import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, Trash2, Save } from 'lucide-react';

interface Category {
    id: string;
    title: string;
    icon?: string;
}

interface CategoriesPageProps {
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
    categories,
    addCategory,
    updateCategory,
    deleteCategory
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
    const [inlineEditId, setInlineEditId] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<Partial<Category>>({});
    const navigate = useNavigate();

    const handleSave = () => {
        if (!editingCategory.title) return alert('Preencha o nome da categoria');
        if (editingCategory.id) {
            updateCategory(editingCategory as Category);
        } else {
            addCategory({ ...editingCategory, id: Date.now().toString() } as Category);
        }
        setIsModalOpen(false);
        setEditingCategory({});
    };

    const handleInlineEdit = (cat: Category) => {
        setInlineEditId(cat.id);
        setInlineEditData({ ...cat });
    };

    const handleInlineSave = () => {
        if (!inlineEditData.title) {
            alert('Preencha o nome da categoria');
            return;
        }
        updateCategory(inlineEditData as Category);
        setInlineEditId(null);
        setInlineEditData({});
    };

    const handleInlineCancel = () => {
        setInlineEditId(null);
        setInlineEditData({});
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                    <h1 className="text-xl font-bold">Categorias</h1>
                </div>
                <button
                    onClick={() => { setEditingCategory({}); setIsModalOpen(true); }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={20} /> Nova
                </button>
            </div>

            <div className="grid gap-3">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        {inlineEditId === cat.id ? (
                            <>
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        className="text-2xl text-center w-16 border rounded p-1"
                                        placeholder="😋"
                                        maxLength={2}
                                        value={inlineEditData.icon || ''}
                                        onChange={e => setInlineEditData({ ...inlineEditData, icon: e.target.value })}
                                    />
                                    <input
                                        className="flex-1 border p-2 rounded font-bold text-lg"
                                        placeholder="Nome da Categoria"
                                        value={inlineEditData.title || ''}
                                        onChange={e => setInlineEditData({ ...inlineEditData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInlineSave}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                        title="Salvar"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button
                                        onClick={handleInlineCancel}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                                        title="Cancelar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{cat.icon || '📦'}</span>
                                    <div>
                                        <p className="font-bold text-lg">{cat.title}</p>
                                        <p className="text-xs text-gray-500">ID: {cat.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleInlineEdit(cat)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                        title="Editar Rápido"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button
                                        onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Editar Completo"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Deletar categoria "${cat.title}"?`)) deleteCategory(cat.id);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        title="Deletar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
                        <h3 className="font-bold text-lg">{editingCategory.id ? 'Editar' : 'Nova'} Categoria</h3>
                        <input
                            className="w-full border p-3 rounded"
                            placeholder="Nome da Categoria"
                            value={editingCategory.title || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, title: e.target.value })}
                        />
                        <input
                            className="w-full border p-3 rounded text-2xl text-center"
                            placeholder="Emoji 😋"
                            maxLength={2}
                            value={editingCategory.icon || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">Dica: Cole um emoji do seu teclado</p>
                        <button
                            onClick={handleSave}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => { setIsModalOpen(false); setEditingCategory({}); }}
                            className="w-full text-gray-500 py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
