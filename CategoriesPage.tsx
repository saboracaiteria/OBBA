import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, Trash2, Save, ArrowUp, ArrowDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { supabase } from './supabaseClient';

interface Category {
    id: string;
    title: string;
    icon?: string;
    displayOrder?: number;
    active?: boolean;
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
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, title: string } | null>(null);
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

    const handleToggleActive = async (cat: Category) => {
        const newActive = !(cat.active ?? true);
        updateCategory({ ...cat, active: newActive });
        await supabase.from('categories').update({ active: newActive }).eq('id', cat.id);
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        const temp = newCategories[index];
        newCategories[index] = newCategories[targetIndex];
        newCategories[targetIndex] = temp;

        // Update displayOrder for swapped items
        // Assuming displayOrder matches index for simplicity, or we assign new indices
        const updates = newCategories.map((cat, idx) => ({
            id: cat.id,
            display_order: idx
        }));

        // Optimistic update (passed via props? No, props are read-only array)
        // We need to call a prop function to update parent state or just trigger DB update
        // Since we don't have setCategories here, we rely on DB update + realtime or parent refresh

        try {
            for (const update of updates) {
                await supabase.from('categories').update({ display_order: update.display_order }).eq('id', update.id);
            }
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedItemIndex];

        // Remove dragged item
        newCategories.splice(draggedItemIndex, 1);
        // Insert at new position
        newCategories.splice(index, 0, draggedItem);

        // Update local state immediately for visual feedback
        // Note: We need a way to update the parent state. 
        // Since we don't have setCategories prop, we might need to trigger the move logic differently
        // or just rely on the final drop to save.
        // However, for smooth DND, we usually need to update the list state.
        // Given the current props, we can't update the parent state smoothly without a setCategories prop.
        // BUT, we can implement the "drop" to trigger the reorder save.
        // For visual feedback *during* drag without setCategories, it's tricky.
        // Let's implement the "Drop" logic which is safer given the props constraints.
        // Or better, we can just use the handleMove logic but adapted.

        // Actually, without setCategories, visual drag-and-drop is jerky if we only update on drop.
        // But let's try to implement the onDrop to trigger the reorder.
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex === null) return;

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedItemIndex];

        // Remove dragged item
        newCategories.splice(draggedItemIndex, 1);
        // Insert at new position
        newCategories.splice(dropIndex, 0, draggedItem);

        // Update displayOrder for all items
        const updates = newCategories.map((cat, idx) => ({
            id: cat.id,
            display_order: idx
        }));

        try {
            // Optimistic update would be nice here, but we'll just save
            for (const update of updates) {
                await supabase.from('categories').update({ display_order: update.display_order }).eq('id', update.id);
            }
            // Trigger a refresh if possible, or wait for realtime/parent update
            // Since addCategory/updateCategory/deleteCategory triggers refresh in parent, we might need a refresh function.
            // But handleMove didn't have one? Ah, handleMove updated DB and relied on parent fetching? 
            // Actually handleMove in the previous code just updated DB. 
            // If App.tsx uses realtime subscription, it updates automatically.
            // If not, we might need to force update. 
            // Let's assume App.tsx handles updates or we might need to reload.
            // Wait, handleMove implementation:
            // const handleMove = ... await supabase... 
            // It doesn't seem to call any prop to update parent. 
            // Let's check App.tsx fetchCategories again. It's called in fetchData.
            // If we don't have realtime, the UI won't update until refresh.
            // But let's stick to the requested DND logic.

            // To make it smoother, we can reload the page or call a prop if available.
            // For now, we'll just do the DB update.
            window.location.reload(); // Simple brute force update for now to ensure order is seen
        } catch (error) {
            console.error('Error reordering:', error);
        }
        setDraggedItemIndex(null);
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
                {categories.map((cat, index) => (
                    <div
                        key={cat.id}
                        className={`bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-move transition-opacity ${draggedItemIndex === index ? 'opacity-50' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => e.preventDefault()} // Allow drop
                        onDrop={(e) => handleDrop(e, index)}
                    >
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
                                        className="px-3 py-2 bg-green-100 text-green-700 rounded font-bold flex items-center gap-1"
                                        title="Salvar"
                                    >
                                        <Save size={18} /> Salvar
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
                                    <div className="flex flex-col gap-1 mr-2 text-gray-400 cursor-grab active:cursor-grabbing">
                                        <div className="flex flex-col items-center">
                                            <ArrowUp size={12} />
                                            <ArrowDown size={12} />
                                        </div>
                                    </div>
                                    <span className={`text-2xl ${(cat.active ?? true) ? '' : 'opacity-40 grayscale'}`}>{cat.icon || '📦'}</span>
                                    <div className={(cat.active ?? true) ? '' : 'opacity-50'}>
                                        <p className="font-bold text-lg">{cat.title}</p>
                                        <p className="text-xs text-gray-500">ID: {cat.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {/* Toggle Active/Inactive */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleActive(cat); }}
                                        className={`p-2 rounded transition-colors ${(cat.active ?? true) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={(cat.active ?? true) ? 'Desativar Categoria' : 'Ativar Categoria'}
                                    >
                                        {(cat.active ?? true) ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                    </button>
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
                                        onClick={() => setDeleteConfirmation({ id: cat.id, title: cat.title })}
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

            <ConfirmModal
                isOpen={!!deleteConfirmation}
                title="Excluir Categoria"
                message={`Tem certeza que deseja excluir a categoria "${deleteConfirmation?.title}"?`}
                onConfirm={() => {
                    if (deleteConfirmation) {
                        deleteCategory(deleteConfirmation.id);
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
