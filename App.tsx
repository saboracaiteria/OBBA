
import React, { useState, createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, ChevronRight, Minus, Plus, Trash2,
  MapPin, Phone, CreditCard, Banknote, Clock, Search,
  ChevronLeft, ChevronDown, ChevronUp, Edit, FileText,
  Settings, BarChart2, List, Folder, LogOut, CheckCircle,
  Printer, Tag, ToggleLeft, Upload, Info, ArrowLeft, AlertCircle,
  Lock as LockIcon, Palette, Package
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { usePrinter } from './PrinterContext';
import {
  CATEGORIES, PRODUCTS, GROUPS, WHATSAPP_NUMBER, LOGO_URL,
  PAYMENT_METHODS, INITIAL_COUPONS, MOCK_ORDERS
} from './constants';
import {
  Category, Product, ProductGroup, CartItem, ProductOption,
  GlobalSettings, Role, Coupon, OrderRecord, OrderStatus, DeliveryMethod, OpeningHour
} from './types';
import { CategoriesPage } from './CategoriesPage';
import { ProductsPage } from './ProductsPage';
import { ReportsPage } from './ReportsPage';
import { PrinterProvider } from './PrinterContext';
import { PrinterSettingsPage } from './PrinterSettingsPage';
import { ImageCropModal } from './ImageCropModal';
import { InventoryPage } from './InventoryPage';
import { ConfirmModal } from './ConfirmModal';
import { supabase } from './supabaseClient';



// --- Helper Functions ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Custom Hooks ---

const usePersistedState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const { value } = await Preferences.get({ key });
        if (value) {
          setState(JSON.parse(value));
        }
      } catch (error) {
        console.error(`Error loading ${key} from Preferences:`, error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, [key]);

  // Save state on change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;

    const saveState = async () => {
      try {
        await Preferences.set({ key, value: JSON.stringify(state) });
      } catch (error) {
        console.error(`Error saving ${key} to Preferences:`, error);
        // Basic check for storage issues (though Preferences handles this differently than localStorage)
      }
    };
    saveState();
  }, [key, state, isLoaded]);

  return [state, setState, isLoaded] as const;
};

// --- Footer Component ---
const Footer = () => (
  <div className="bg-gray-800 text-gray-300 py-6 px-4 mt-12">
    <div className="max-w-4xl mx-auto">
      {/* Instagram Link */}
      <div className="flex justify-center mb-4">
        <a
          href="https://www.instagram.com/obba_acai_/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Siga-nos no Instagram
        </a>
      </div>

      {/* Location & Year */}
      <div className="text-center mb-3">
        <p className="text-sm">Canaã dos Carajás - PA</p>
        <p className="text-xs text-gray-400 mt-1">© 2025-2026 Obba Açaí</p>
      </div>

      {/* Developer Credit */}
      <div className="text-center pt-3 border-t border-gray-700">
        <p className="text-xs">
          Desenvolvido por{' '}
          <a
            href="https://www.instagram.com/_nildoxz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
          >
            @_nildoxz
          </a>
        </p>
      </div>
    </div>
  </div>
);

// --- Context ---

interface AppContextType {
  products: Product[];
  categories: Category[];
  groups: ProductGroup[];
  cart: CartItem[];
  settings: GlobalSettings;
  coupons: Coupon[];
  orders: OrderRecord[];
  adminRole: Role;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  updateCartNote: (cartId: string, note: string) => void;
  clearCart: () => void;

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  addGroup: (group: ProductGroup) => void;
  updateGroup: (group: ProductGroup) => void;
  deleteGroup: (id: string) => void;

  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;

  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  setAdminRole: (role: Role) => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  checkStoreStatus: () => 'open' | 'closed';
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dados locais (apenas carrinho e estado da UI)
  const [cart, setCart, cartLoaded] = usePersistedState<CartItem[]>('cart', []);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminRole, setAdminRole, roleLoaded] = usePersistedState<Role>('adminRole', null);
  const [appliedCoupon, setAppliedCoupon, couponLoaded] = usePersistedState<Coupon | null>('appliedCoupon', null);
  const [loading, setLoading] = useState(true);

  const isStorageLoaded = cartLoaded && roleLoaded && couponLoaded;

  // Dados do Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({
    storeName: 'Obba Açaí',
    logoUrl: LOGO_URL,
    logoShape: 'circle',
    bannerUrl: '',
    whatsappNumber: WHATSAPP_NUMBER,
    storeStatus: 'auto',
    deliveryFee: 5.00,
    deliveryOnly: false,
    openingHours: []
  });

  // Carregar dados iniciais e configurar Realtime
  useEffect(() => {
    const init = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Erro fatal ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isStorageLoaded) {
      init();
    }
  }, [isStorageLoaded]);


  // Configurar subscriptions para atualizações em tempo real
  useEffect(() => {
    const channels = [
      supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe(),
      supabase.channel('public:categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories()).subscribe(),
      supabase.channel('public:groups').on('postgres_changes', { event: '*', schema: 'public', table: 'product_groups' }, () => fetchGroups()).subscribe(),
      supabase.channel('public:options').on('postgres_changes', { event: '*', schema: 'public', table: 'product_options' }, () => fetchGroups()).subscribe(), // Recarrega grupos se opções mudarem
      supabase.channel('public:coupons').on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => fetchCoupons()).subscribe(),
      supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders()).subscribe(),
      supabase.channel('public:settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchSettings()).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  // --- Funções de Fetch ---

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProducts().catch(e => console.error('Erro products:', e)),
        fetchCategories().catch(e => console.error('Erro categories:', e)),
        fetchGroups().catch(e => console.error('Erro groups:', e)),
        fetchCoupons().catch(e => console.error('Erro coupons:', e)),
        fetchOrders().catch(e => console.error('Erro orders:', e)),
        fetchSettings().catch(e => console.error('Erro settings:', e))
      ]);
    } catch (e) {
      console.error('Erro no Promise.all:', e);
    }
  };


  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select(`
      *,
      product_group_relations (group_id)
    `);

    if (data) {
      // Mapear para o formato interno (adicionar groupIds)
      const mappedProducts: Product[] = data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        categoryId: p.category_id,
        groupIds: p.product_group_relations?.map((r: any) => r.group_id) || []
      }));
      setProducts(mappedProducts);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchGroups = async () => {
    const { data } = await supabase.from('product_groups').select(`
      *,
      options:product_options(*)
    `);

    if (data) {
      // Mapear opções para garantir ordem ou formato se necessário
      const mappedGroups: ProductGroup[] = data.map(g => ({
        id: g.id,
        title: g.title,
        min: g.min,
        max: g.max,
        options: g.options || []
      }));
      setGroups(mappedGroups);
    }
  };

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*');
    if (data) {
      const mappedCoupons: Coupon[] = data.map(c => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        active: c.active,
        usageCount: c.usage_count,
        minOrderValue: c.min_order_value
      }));
      setCoupons(mappedCoupons);
    }
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (data) {
      // Mapear campos snake_case para camelCase
      const mappedOrders: OrderRecord[] = data.map(o => ({
        id: o.id,
        date: o.date,
        customerName: o.customer_name,
        whatsapp: o.whatsapp,
        method: o.method,
        address: o.address,
        paymentMethod: o.payment_method,
        total: o.total,
        itemsSummary: o.items_summary,
        fullDetails: o.full_details,
        status: o.status
      }));
      setOrders(mappedOrders);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setSettings({
        storeName: data.store_name,
        logoUrl: data.logo_url,
        logoShape: data.logo_shape || 'circle',
        bannerUrl: data.banner_url,
        whatsappNumber: data.whatsapp_number,
        storeStatus: data.store_status,
        deliveryFee: data.delivery_fee,
        deliveryOnly: data.delivery_only,
        openingHours: data.opening_hours,
        themeColors: data.theme_colors
      });
    }
  };

  // Aplicar tema
  useEffect(() => {
    if (settings.themeColors) {
      const root = document.documentElement;
      const colors = settings.themeColors as any;

      if (colors.headerBg) root.style.setProperty('--color-header-bg', colors.headerBg);
      if (colors.headerText) root.style.setProperty('--color-header-text', colors.headerText);
      if (colors.background) root.style.setProperty('--color-background', colors.background);
      if (colors.cardBg) root.style.setProperty('--color-card-bg', colors.cardBg);
      if (colors.cardText) root.style.setProperty('--color-card-text', colors.cardText);
      if (colors.buttonPrimary) root.style.setProperty('--color-button-primary', colors.buttonPrimary);
      if (colors.buttonText) root.style.setProperty('--color-button-text', colors.buttonText);
      if (colors.textPrimary) root.style.setProperty('--color-text-primary', colors.textPrimary);
      if (colors.textSecondary) root.style.setProperty('--color-text-secondary', colors.textSecondary);
    }
  }, [settings.themeColors]);

  // --- Funções de Mutação (CRUD) ---

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) return prev.filter(item => item.cartId !== cartId);
      return prev.map(item => item.cartId === cartId ? { ...item, quantity } : item);
    });
  };

  const updateCartNote = (cartId: string, note: string) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, note } : item));
  };

  const clearCart = () => setCart([]);

  const addProduct = async (p: Product) => {
    // 1. Inserir produto
    const { data: productData, error } = await supabase.from('products').insert([{
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category_id: p.categoryId
    }]).select().single();

    if (error || !productData) {
      console.error('Erro ao adicionar produto:', error);
      return;
    }

    // 2. Inserir relações de grupo
    if (p.groupIds && p.groupIds.length > 0) {
      const relations = p.groupIds.map(gid => ({
        product_id: productData.id,
        group_id: gid
      }));
      await supabase.from('product_group_relations').insert(relations);
    }
  };

  const updateProduct = async (p: Product) => {
    // 1. Atualizar produto
    await supabase.from('products').update({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category_id: p.categoryId
    }).eq('id', p.id);

    // 2. Atualizar relações (remover todas e adicionar novas)
    // Nota: Em produção idealmente faria diff, mas delete+insert é mais simples
    await supabase.from('product_group_relations').delete().eq('product_id', p.id);

    if (p.groupIds && p.groupIds.length > 0) {
      const relations = p.groupIds.map(gid => ({
        product_id: p.id,
        group_id: gid
      }));
      await supabase.from('product_group_relations').insert(relations);
    }
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
  };

  const addCategory = async (c: Category) => {
    await supabase.from('categories').insert([{ title: c.title, icon: c.icon }]);
  };

  const updateCategory = async (c: Category) => {
    await supabase.from('categories').update({ title: c.title, icon: c.icon }).eq('id', c.id);
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
  };

  const addGroup = async (g: ProductGroup) => {
    // 1. Inserir grupo
    const { data: groupData, error } = await supabase.from('product_groups').insert([{
      title: g.title,
      min: g.min,
      max: g.max
    }]).select().single();

    if (error || !groupData) return;

    // 2. Inserir opções
    if (g.options && g.options.length > 0) {
      const options = g.options.map(o => ({
        group_id: groupData.id,
        name: o.name,
        price: o.price,
        description: o.description
      }));
      await supabase.from('product_options').insert(options);
    }
  };

  const updateGroup = async (g: ProductGroup) => {
    // 1. Atualizar grupo
    await supabase.from('product_groups').update({
      title: g.title,
      min: g.min,
      max: g.max
    }).eq('id', g.id);

    // 2. Atualizar opções (estratégia simples: delete all + insert all)
    // CUIDADO: Isso muda os IDs das opções. Se pedidos referenciarem opções por ID, isso quebraria histórico.
    // Como pedidos salvam snapshot (fullDetails), não deve ser problema crítico agora.
    await supabase.from('product_options').delete().eq('group_id', g.id);

    if (g.options && g.options.length > 0) {
      const options = g.options.map(o => ({
        group_id: g.id,
        name: o.name,
        price: o.price,
        description: o.description
      }));
      await supabase.from('product_options').insert(options);
    }
  };

  const deleteGroup = async (id: string) => {
    await supabase.from('product_groups').delete().eq('id', id);
  };

  const addCoupon = async (c: Coupon) => {
    const { data, error } = await supabase.from('coupons').insert([{
      code: c.code,
      type: c.type,
      value: c.value,
      active: c.active,
      usage_count: c.usageCount,
      min_order_value: c.minOrderValue
    }]);

    if (error) {
      console.error('Erro ao adicionar cupom:', error);
      throw error;
    }
    // Realtime subscription will call fetchCoupons() automatically
  };

  const updateCoupon = async (c: Coupon) => {
    await supabase.from('coupons').update({
      code: c.code,
      type: c.type,
      value: c.value,
      active: c.active,
      usage_count: c.usageCount,
      min_order_value: c.minOrderValue
    }).eq('id', c.id);
    // Realtime subscription will call fetchCoupons() automatically
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id);
    // Realtime subscription will call fetchCoupons() automatically
  };

  const updateSettings = async (s: Partial<GlobalSettings>) => {
    // Optimistic Update: Update local state immediately
    setSettings(prev => ({ ...prev, ...s }));

    // Mapear camelCase para snake_case
    const dbSettings: any = {};
    if (s.storeName !== undefined) dbSettings.store_name = s.storeName;
    if (s.logoUrl !== undefined) dbSettings.logo_url = s.logoUrl;
    if (s.logoShape !== undefined) dbSettings.logo_shape = s.logoShape;
    if (s.bannerUrl !== undefined) dbSettings.banner_url = s.bannerUrl;
    if (s.whatsappNumber !== undefined) dbSettings.whatsapp_number = s.whatsappNumber;
    if (s.storeStatus !== undefined) dbSettings.store_status = s.storeStatus;
    if (s.deliveryFee !== undefined) dbSettings.delivery_fee = s.deliveryFee;
    if (s.deliveryOnly !== undefined) dbSettings.delivery_only = s.deliveryOnly;
    if (s.openingHours !== undefined) dbSettings.opening_hours = s.openingHours;
    if (s.themeColors !== undefined) dbSettings.theme_colors = s.themeColors;

    await supabase.from('settings').update(dbSettings).eq('id', 1);
  };

  const addOrder = async (o: OrderRecord) => {
    await supabase.from('orders').insert([{
      date: o.date,
      customer_name: o.customerName,
      whatsapp: o.whatsapp,
      method: o.method,
      address: o.address,
      payment_method: o.paymentMethod,
      total: o.total,
      items_summary: o.itemsSummary,
      full_details: o.fullDetails,
      status: o.status
    }]);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const deleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await supabase.from('orders').delete().eq('id', id);
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active);
    if (!coupon) {
      return { success: false, message: 'Cupom inválido ou expirado' };
    }

    // Check minimum order value
    const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return { success: false, message: `Valor mínimo para este cupom: ${formatCurrency(coupon.minOrderValue)}` };
    }

    setAppliedCoupon(coupon);
    return { success: true, message: 'Cupom aplicado com sucesso!' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const checkStoreStatus = () => {
    try {
      // Defensive check: return closed if settings not fully initialized
      if (!settings || !settings.openingHours || !Array.isArray(settings.openingHours)) {
        return 'closed';
      }

      // 1. Force Open/Closed
      if (settings.storeStatus === 'open') return 'open';
      if (settings.storeStatus === 'closed') return 'closed';

      // 2. Automatic Mode (default if 'auto' or undefined)
      const now = new Date();
      const day = now.getDay();
      const config = settings.openingHours.find(h => h.dayOfWeek === day);

      if (!config || !config.enabled) return 'closed';
      if (!config.open || !config.close) return 'closed';

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = config.open.split(':').map(Number);
      const [closeH, closeM] = config.close.split(':').map(Number);

      if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) return 'closed';

      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;

      return (currentTime >= openTime && currentTime <= closeTime) ? 'open' : 'closed';
    } catch (e) {
      console.error('Error checking store status:', e);
      return 'closed';
    }
  };

  return (
    <AppContext.Provider value={{
      products, categories, groups, cart, settings, coupons, orders, adminRole, isSidebarOpen,
      addToCart, removeFromCart, updateCartQuantity, updateCartNote, clearCart,
      addProduct, updateProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addGroup, updateGroup, deleteGroup,
      addCoupon, updateCoupon, deleteCoupon,
      updateSettings, setAdminRole, addOrder,
      updateOrderStatus,
      deleteOrder,
      checkStoreStatus, setSidebarOpen,
      appliedCoupon, applyCoupon, removeCoupon,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Components ---

const Sidebar = () => {
  const { isSidebarOpen, setSidebarOpen, categories, setAdminRole } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (password === '123') {
      setAdminRole('admin');
      navigate('/panel');
      setShowPassword(false);
      setSidebarOpen(false);
      setPassword('');
    } else if (password === '777') {
      setAdminRole('employee');
      navigate('/panel');
      setShowPassword(false);
      setSidebarOpen(false);
      setPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div
          className="p-4 text-white font-bold text-lg flex justify-between items-center transition-colors duration-300"
          style={{
            backgroundColor: 'var(--color-header-bg, #4E0797)',
            color: 'var(--color-header-text, #ffffff)'
          }}
        >
          <span>Menu</span>
          <button onClick={() => setSidebarOpen(false)}><X style={{ color: 'var(--color-header-text, #ffffff)' }} /></button>
        </div>
        <div className="py-2">
          <button onClick={() => { navigate('/'); setSidebarOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-brand-purple font-medium text-gray-700">
            Início
          </button>
          <div className="border-t border-gray-100 my-2" />
          {categories.map(cat => (
            <button key={cat.id} onClick={() => {
              navigate('/');
              setTimeout(() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
              setSidebarOpen(false);
            }} className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-600 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
            </button>
          ))}
          <div className="border-t border-gray-100 my-2" />
          <button onClick={() => setShowPassword(true)} className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-600 flex items-center gap-2">
            <LockIcon size={18} /> Painel Administrativo
          </button>
        </div>
      </div>

      {showPassword && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-center">Acesso Restrito</h3>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full p-3 border rounded-lg mb-4 text-center text-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-purple"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowPassword(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700">Cancelar</button>
              <button onClick={handleAdminAccess} className="flex-1 py-3 bg-brand-purple text-white rounded-lg font-bold">Entrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Header = () => {
  const { setSidebarOpen } = useApp();
  return (
    <div
      className="h-16 flex items-center justify-between px-4 shadow-md sticky top-0 z-40 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-header-bg, #4E0797)' }}
    >
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
          <Menu size={28} style={{ color: 'var(--color-header-text, #ffffff)' }} />
        </button>
        <button className="text-white p-1">
          <Search size={28} style={{ color: 'var(--color-header-text, #ffffff)' }} />
        </button>
      </div>
    </div>
  );
};

// Modified ProductCard to match horizontal scrolling layout
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, checkStoreStatus } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosedToast, setShowClosedToast] = useState(false);

  const hasOptions = product.groupIds && product.groupIds.length > 0;

  const handleAdd = () => {
    const status = checkStoreStatus();
    if (status === 'closed') {
      setShowClosedToast(true);
      setTimeout(() => setShowClosedToast(false), 2000);
      return;
    }

    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({
        cartId: Date.now().toString(),
        product,
        quantity: 1,
        selectedOptions: {},
        totalPrice: product.price
      });
    }
  };

  return (
    <>
      <div
        className={`flex-shrink-0 w-[170px] bg-white rounded-xl shadow-md border border-gray-200 mr-3 mb-2 overflow-hidden cursor-pointer pb-2 transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:bg-gray-50 active:scale-[0.98] active:shadow-sm ${checkStoreStatus() === 'closed' ? 'opacity-75 grayscale' : ''}`}
        onClick={handleAdd}
      >
        <div className="h-[130px] w-full overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105" />
        </div>
        <div className="p-2.5 flex flex-col h-[125px]">
          <h3 className="font-bold text-gray-800 text-[13px] leading-tight mb-1.5 line-clamp-2 h-9">{product.name}</h3>
          <p className="text-[9px] text-gray-500 line-clamp-3 mb-auto">{product.description}</p>
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100">
            <span className="font-bold text-green-600 text-sm">R$ {product.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {isModalOpen && <ProductModal product={product} onClose={() => setIsModalOpen(false)} />}

      {/* Closed Store Toast */}
      {
        showClosedToast && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <AlertCircle size={20} />
            <span className="font-bold">Loja Fechada!</span>
          </div>
        )
      }
    </>
  );
};

const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { groups, addToCart } = useApp();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const productGroups = useMemo(() => {
    if (!product.groupIds) return [];
    return product.groupIds.map(gid => groups.find(g => g.id === gid)).filter(Boolean) as ProductGroup[];
  }, [product, groups]);

  const calculateTotal = () => {
    let total = product.price;
    productGroups.forEach(group => {
      group.options.forEach(opt => {
        const qty = selectedOptions[opt.id] || 0;
        if (qty > 0 && opt.price) {
          total += opt.price * qty;
        }
      });
    });
    return total * quantity;
  };

  const handleOptionChange = (groupId: string, optionId: string, delta: number, max: number) => {
    const currentQty = selectedOptions[optionId] || 0;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const currentGroupTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);

    // Check max limit only when adding
    if (delta > 0 && currentGroupTotal >= group.max) return;

    const newQty = Math.max(0, currentQty + delta);
    setSelectedOptions(prev => ({ ...prev, [optionId]: newQty }));
  };

  const isValid = productGroups.every(g => {
    const total = g.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
    return total >= g.min;
  });

  const handleConfirm = () => {
    if (!isValid) return;
    addToCart({
      cartId: Date.now().toString(),
      product,
      quantity,
      selectedOptions,
      note,
      totalPrice: calculateTotal() / quantity
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between text-white shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--color-header-bg, #4E0797)',
            color: 'var(--color-header-text, #ffffff)'
          }}
        >
          <button onClick={onClose}><ArrowLeft size={24} style={{ color: 'var(--color-header-text, #ffffff)' }} /></button>
          <h2 className="text-lg font-bold uppercase">{product.name}</h2>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Product Info */}
          {/* <div className="bg-white p-4 mb-2">
            <img src={product.image} className="w-full h-48 object-cover rounded-lg mb-3" />
            <p className="text-gray-600 text-sm">{product.description}</p>
            <p className="text-xl font-bold text-green-600 mt-2">R$ {product.price.toFixed(2)}</p>
          </div> */}

          {/* Groups */}
          <div className="p-4 space-y-6">
            {productGroups.map(group => {
              const currentTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
              const filteredOptions = group.options.filter(opt =>
                opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
              );

              return (
                <div key={group.id}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{group.title}</h3>
                    <div className="flex justify-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Minimo: {group.min}</span>
                      <span>Máximo: {group.max}</span>
                    </div>
                    <p className="text-sm text-gray-600">Valor Adicional: R$ 0.00</p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Digite para pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredOptions.map(opt => {
                      const qty = selectedOptions[opt.id] || 0;
                      return (
                        <div key={opt.id} className={`bg-white p-4 rounded-lg shadow-sm border ${qty > 0 ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'} transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] hover:bg-gray-50 cursor-pointer`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="font-bold text-gray-800">{opt.name}</h4>
                              {opt.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-tight">{opt.description}</p>
                              )}
                              <div className="mt-2 inline-block px-3 py-1 rounded-full border border-gray-300 text-sm font-medium text-gray-700">
                                + R$ {opt.price ? opt.price.toFixed(2).replace('.', ',') : '0,00'}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-center">
                              <button
                                onClick={() => handleOptionChange(group.id, opt.id, -1, group.max)}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${qty > 0 ? 'text-red-500 hover:bg-red-50 active:scale-90' : 'text-gray-300'}`}
                                disabled={qty === 0}
                              >
                                <Minus size={20} />
                              </button>
                              <span className="font-bold text-lg w-6 text-center">{qty}</span>
                              <button
                                onClick={() => handleOptionChange(group.id, opt.id, 1, group.max)}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${currentTotal < group.max ? 'text-green-600 hover:bg-green-50 active:scale-90' : 'text-gray-300'}`}
                                disabled={currentTotal >= group.max}
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800">Observações</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Sem cebola, caprichar no molho..."
                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          <button
            disabled={!isValid}
            onClick={handleConfirm}
            className="w-full h-12 bg-[#D32F2F] disabled:bg-gray-400 text-white font-bold rounded text-lg hover:bg-[#B71C1C] transition-colors uppercase tracking-wide"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const { categories, products, settings, checkStoreStatus } = useApp();
  const status = checkStoreStatus();

  return (
    <div className="bg-[#f6f6f6] min-h-screen">
      {/* Cover Image with Overlapping Logo */}
      <div className="relative">
        {/* Cover Image - Only show if bannerUrl exists */}
        {settings.bannerUrl && (
          <div className="w-full h-48 md:h-64 lg:h-72 overflow-hidden">
            <img
              src={settings.bannerUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Logo positioned to overlap cover */}
        <div className={`${settings.bannerUrl ? 'absolute -bottom-16' : 'relative'} left-0 right-0 flex justify-center`}>
          <div className={`bg-white ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'} p-2 shadow-lg`}>
            <img
              src={settings.logoUrl}
              alt="Logo"
              className={`w-32 h-32 object-cover ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'} border border-white`}
            />
          </div>
        </div>
      </div>

      {/* Reduced spacer when banner exists */}
      {settings.bannerUrl && <div className="h-16 bg-white"></div>}

      <div className="px-4 -mt-0">
        {/* Status Badge */}
        <div className="flex flex-col items-center gap-2 -mt-0 mb-3 pt-2">
          {status === 'closed' ? (
            <span className="bg-red-600 text-white px-6 py-2 rounded-md font-medium text-sm shadow-sm uppercase tracking-wide">
              🔴 Loja Fechada
            </span>
          ) : (
            <span className="bg-[#4caf50] text-white px-6 py-2 rounded-md font-medium text-sm shadow-sm uppercase tracking-wide">
              🟢 Aberto até às 23:00
            </span>
          )}
          {settings.deliveryOnly && status === 'open' && (
            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-md font-medium text-xs shadow-sm">
              📦 Aceitando pedidos para retirada
            </span>
          )}
        </div>

        {/* Info Rows */}
        <div className="flex justify-between items-center bg-transparent mb-3 px-2">
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1 text-gray-700 font-bold text-sm">
              <Clock size={16} /> Entrega
            </div>
            <span className="text-gray-600 text-xs font-medium">40min à 1h</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1 text-gray-700 font-bold text-sm">
              <Clock size={16} /> Retirada
            </div>
            <span className="text-gray-600 text-xs font-medium">20min à 45min</span>
          </div>
        </div>

        {/* Hours Link */}
        <div className="flex justify-center items-center gap-1 text-gray-600 mb-3">
          <Info size={16} />
          <span className="font-bold text-sm">Horários</span>
        </div>

        {/* Warning Alert */}
        <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-center text-sm font-medium">
          Entregas somente até as 21:00hrs!
        </div>

        {/* Categories */}
        <div className="space-y-5">
          {categories.map(cat => {
            const catProducts = products.filter(p => p.categoryId === cat.id);
            return (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <h2 className="text-xl font-bold text-gray-700 mb-3 pl-1 flex items-center gap-2">
                  {cat.title} {cat.icon}
                </h2>
                {/* Horizontal scrolling container */}
                {catProducts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg py-8 px-4 text-center">
                    <p className="text-gray-400 text-sm italic">
                      Nenhum produto disponível no momento
                    </p>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto pb-4 no-scrollbar">
                    {catProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton />
      <Footer />
    </div>
  );
};

const FloatingCartButton = () => {
  const { cart } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  // Animation state
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className={`fixed bottom-6 right-6 w-16 h-16 bg-brand-red text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:opacity-90 transition-all ${animate ? 'scale-125' : 'scale-100'}`}
    >
      <ShoppingCart size={28} />
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-brand-red font-bold rounded-full flex items-center justify-center text-xs shadow-md border border-gray-100">
        {cartCount}
      </span>
    </button>
  );
};

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, updateCartNote, settings, checkStoreStatus, appliedCoupon, applyCoupon, removeCoupon, groups } = useApp();
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      setCouponCode('');
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleEditNote = (cartId: string, currentNote?: string) => {
    setEditingNote(cartId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = () => {
    if (editingNote) {
      updateCartNote(editingNote, noteText);
      setEditingNote(null);
      setNoteText('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f6f6f6]">
        <ShoppingCart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Seu carrinho está vazio</h2>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-brand-red text-white rounded-lg font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-32">
      {/* Custom Cart Header */}
      <div className="bg-brand-purple text-white p-4 text-center font-bold sticky top-0 z-10">
        CONFIRA SEU PEDIDO!
      </div>

      <div className="p-4 space-y-3">
        {cart.map(item => {
          // Get option names for this item
          const selectedOptionsText: string[] = [];
          Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
            if ((qty as number) > 0) {
              for (const group of groups) {
                const option = group.options.find(opt => opt.id === optionId);
                if (option) {
                  selectedOptionsText.push(`+ ${option.name} (${qty}x)`);
                  break;
                }
              }
            }
          });

          return (
            <div key={item.cartId} className="bg-white p-3 rounded shadow-sm border border-gray-200 flex justify-between">
              <div className="flex flex-col justify-between items-start flex-1 pr-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm uppercase">{item.product.name}</h3>
                  <p className="text-gray-500 text-xs">R$ {item.totalPrice.toFixed(2)}</p>
                  {selectedOptionsText.length > 0 && (
                    <div className="mt-1">
                      {selectedOptionsText.map((opt, idx) => (
                        <p key={idx} className="text-[10px] text-gray-600">{opt}</p>
                      ))}
                    </div>
                  )}
                  {item.note && <p className="text-[10px] text-blue-600 mt-1 italic">Obs: {item.note}</p>}
                </div>

                <div className="mt-2">
                  <p className="font-bold text-sm mb-2">Subtotal: R$ {(item.totalPrice * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => handleEditNote(item.cartId, item.note)}
                    className="bg-red-600 text-white text-[10px] font-bold px-4 py-1 rounded flex items-center gap-1 hover:bg-red-700"
                  >
                    <Edit size={10} /> OBSERVAÇÃO
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center shadow-sm">
                  <Plus size={16} />
                </button>
                <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                <button onClick={() => removeFromCart(item.cartId)} className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Adicionar Observação</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Sem cebola, caprichar no molho..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setEditingNote(null); setNoteText(''); }}
                className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Cart Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f6f6f6] border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="mb-4 bg-white p-3 rounded shadow-sm">
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Cupom de desconto"
                className="flex-1 border p-2 rounded text-sm uppercase"
              />
              <button onClick={handleApplyCoupon} className="bg-purple-600 text-white px-4 rounded font-bold text-sm">
                APLICAR
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex justify-between items-center bg-green-50 p-2 rounded border border-green-200">
                <span className="text-green-700 text-sm font-bold">Cupom: {appliedCoupon.code}</span>
                <button onClick={removeCoupon} className="text-red-500 text-xs font-bold">REMOVER</button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxa de Entrega</span>
              <span>{formatCurrency(settings.deliveryFee)}</span>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <span className="bg-black text-white px-4 py-1 rounded font-bold text-sm">TOTAL {formatCurrency(finalTotal)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded text-xs uppercase">
              CONTINUAR COMPRANDO
            </button>
            {checkStoreStatus() === 'closed' ? (
              <button disabled className="flex-1 py-3 bg-gray-400 text-white font-bold rounded text-xs uppercase cursor-not-allowed flex flex-col items-center justify-center leading-tight">
                <span>LOJA FECHADA</span>
                <span className="text-[9px]">Não aceitamos pedidos</span>
              </button>
            ) : (
              <button onClick={() => navigate('/checkout')} className="flex-1 py-3 bg-red-600 text-white font-bold rounded text-xs uppercase hover:bg-red-700">
                FINALIZAR PEDIDO
              </button>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

const CheckoutPage = () => {
  const { cart, settings, clearCart, addOrder, appliedCoupon, removeCoupon, groups } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const navigate = useNavigate();
  const { checkStoreStatus } = useApp();

  useEffect(() => {
    if (checkStoreStatus() === 'closed') {
      navigate('/');
    }
  }, [checkStoreStatus, navigate]);

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const total = Math.max(0, subtotal - discount) + (deliveryMethod === DeliveryMethod.DELIVERY ? settings.deliveryFee : 0);

  const handleFinish = () => {
    if (!customerName || !phone) return alert('Preencha nome e telefone');
    if (deliveryMethod === DeliveryMethod.DELIVERY && !address) return alert('Preencha o endereço');

    const newOrder: OrderRecord = {
      id: Math.floor(Math.random() * 10000).toString(),
      date: new Date().toISOString(),
      customerName,
      whatsapp: phone,
      method: deliveryMethod,
      address,
      paymentMethod,
      total,
      itemsSummary: `${cart.length} itens`,
      status: 'pending',
      fullDetails: cart
    };

    addOrder(newOrder);

    const itemsText = cart.map(i => {
      let txt = `${i.quantity}x ${i.product.name}`;

      // Get option names from groups
      const selectedOptionsText: string[] = [];
      Object.entries(i.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          // Find the option name
          for (const group of groups) {
            const option = group.options.find(opt => opt.id === optionId);
            if (option) {
              selectedOptionsText.push(`${option.name} ${qty}x`);
              break;
            }
          }
        }
      });

      if (selectedOptionsText.length > 0) {
        txt += `\n   (${selectedOptionsText.join(', ')})`;
      }

      if (i.note) txt += `\n   Obs: ${i.note}`;
      return txt;
    }).join('\n');

    const msg = `*Novo Pedido*\nCliente: ${customerName}\nTel: ${phone}\nTipo: ${deliveryMethod}\nEndereço: ${address}\nPagamento: ${paymentMethod}\n\nItens:\n${itemsText}${appliedCoupon ? `\n\nCupom: ${appliedCoupon.code} (-${formatCurrency(discount)})` : ''}\n\n*Total: ${formatCurrency(total)}*`;

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clearCart();
    removeCoupon();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#333] p-4 text-white">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/cart')}><ChevronLeft /></button>
          <h2 className="ml-4 font-bold">PREENCHA OS CAMPOS</h2>
        </div>

        <div className="bg-white rounded-lg p-4 text-gray-800 space-y-4 shadow-lg">
          <input className="w-full border p-2 rounded bg-white" placeholder="Nome completo" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <input className="w-full border p-2 rounded bg-white" placeholder="WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} />

          <div className="flex border rounded overflow-hidden">
            <button onClick={() => setDeliveryMethod(DeliveryMethod.DELIVERY)} className={`flex-1 py-2 ${deliveryMethod === DeliveryMethod.DELIVERY ? 'bg-gray-100 font-bold' : 'bg-white'}`}>ENTREGAR</button>
            <button onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)} className={`flex-1 py-2 ${deliveryMethod === DeliveryMethod.PICKUP ? 'bg-gray-100 font-bold' : 'bg-white'}`}>VOU RETIRAR</button>
          </div>

          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="space-y-2">
              <select className="w-full border p-2 rounded bg-white text-gray-500">
                <option>Selecione o Município</option>
                <option>Canaã dos Carajás</option>
              </select>
              <input className="w-full border p-2 rounded bg-white" placeholder="Bairro" />
              <input className="w-full border p-2 rounded bg-white" placeholder="Rua / Logradouro" value={address} onChange={e => setAddress(e.target.value)} />
              <input className="w-full border p-2 rounded bg-white" placeholder="Número" />
              <input className="w-full border p-2 rounded bg-white" placeholder="Ponto de referência" />
            </div>
          )}

          <select className="w-full border p-2 rounded bg-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-6 bg-[#f6f6f6] text-gray-800 p-4 rounded-lg flex justify-between items-center">
          <span>Total</span>
          <span className="font-bold text-xl">{formatCurrency(total)}</span>
        </div>

        <button onClick={handleFinish} className="mt-4 w-full bg-[#4caf50] text-white font-bold py-3 rounded flex items-center justify-center gap-2">
          <span className="bg-white/20 p-1 rounded-full"><Phone size={16} /></span> ENVIAR
        </button>
      </div>
    </div>
  );
};

// --- Admin Panel (Full Features) ---

const AdminPanel = () => {
  const { adminRole, setAdminRole } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminRole) navigate('/');
  }, [adminRole, navigate]);

  const menuItems = [
    { title: 'Pedidos', icon: <FileText size={32} />, path: '/panel/orders', role: ['admin', 'employee'] },
    { title: 'Configurações', icon: <Settings size={32} />, path: '/panel/settings', role: ['admin'] },
    { title: 'Relatório', icon: <BarChart2 size={32} />, path: '/panel/reports', role: ['admin'] },
    { title: 'Categorias', icon: <List size={32} />, path: '/panel/categories', role: ['admin'] },
    { title: 'Produtos', icon: <Folder size={32} />, path: '/panel/products', role: ['admin'] },
    { title: 'Adicionais', icon: <ToggleLeft size={32} />, path: '/panel/addons', role: ['admin'] },
    { title: 'Cupons', icon: <Tag size={32} />, path: '/panel/coupons', role: ['admin'] },
    { title: 'Cores do Site', icon: <Palette size={32} />, path: '/panel/theme', role: ['admin'] },
    { title: 'Estoque', icon: <Package size={32} />, path: '/panel/inventory', role: ['admin'] },
    { title: 'Impressora', icon: <Printer size={32} />, path: '/panel/printer', role: ['admin', 'employee'] },
  ];


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Painel {adminRole === 'admin' ? 'Administrativo' : 'Funcionário'}</h1>
        <button onClick={() => { setAdminRole(null); navigate('/'); }} className="text-red-600 flex items-center gap-1 font-bold">
          <LogOut size={20} /> Sair
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuItems.filter(item => item.role.includes(adminRole || '')).map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[100px]"
          >
            <div className="text-gray-600">{React.cloneElement(item.icon, { size: 24 })}</div>
            <span className="font-medium text-gray-700 text-sm text-center">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { orders, updateOrderStatus, groups } = useApp();
  const navigate = useNavigate();
  const { printText, connectedDevice } = usePrinter();

  const handlePrintOrder = async (order: OrderRecord) => {
    if (!connectedDevice) {
      alert('Conecte uma impressora primeiro!');
      return;
    }

    const itemsText = order.fullDetails.map(item => {
      let txt = `[L]${item.quantity}x ${item.product.name} R$${item.totalPrice.toFixed(2)}`;

      // Get option names from groups
      const selectedOptionsText: string[] = [];
      Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          // Find the option name
          for (const group of groups) {
            const option = group.options.find(opt => opt.id === optionId);
            if (option) {
              selectedOptionsText.push(`${option.name} ${qty}x`);
              break;
            }
          }
        }
      });

      if (selectedOptionsText.length > 0) {
        txt += `\n[L]   (${selectedOptionsText.join(', ')})`;
      }

      if (item.note) txt += `\n[L]   Obs: ${item.note}`;
      return txt;
    }).join('\n');

    const receipt =
      "[C]<b>OBBA ACAI DELIVERY</b>\n" +
      "[L]\n" +
      `[L]Pedido: #${order.id}\n` +
      `[L]Data: ${new Date(order.date).toLocaleString()}\n` +
      "[L]--------------------------------\n" +
      `[L]Cliente: ${order.customerName}\n` +
      `[L]Tel: ${order.whatsapp}\n` +
      `[L]End: ${order.address || 'Retirada'}\n` +
      "[L]--------------------------------\n" +
      "[L]<b>ITENS</b>\n" +
      itemsText + "\n" +
      "[L]--------------------------------\n" +
      `[L]Pagamento: ${order.paymentMethod}\n` +
      `[L]Entrega: ${order.method === DeliveryMethod.DELIVERY ? 'Entrega' : 'Retirada'}\n` +
      `[R]<b>TOTAL: ${formatCurrency(order.total)}</b>\n` +
      "[L]\n[L]\n[L]\n";

    await printText(receipt);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string } | null>(null);
  const { deleteOrder, adminRole } = useApp();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Pedidos</h1>
      </div>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-600">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-lg">#{order.id}</span>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{order.status}</span>
            </div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.itemsSummary}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className="font-bold">{formatCurrency(order.total)}</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedOrder(order)} className="p-2 bg-blue-50 text-blue-600 rounded text-xs font-bold">Ver Detalhes</button>
                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded"><CheckCircle size={18} /></button>
                <button onClick={() => handlePrintOrder(order)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-200"><Printer size={18} /></button>
                {adminRole === 'admin' && (
                  <button
                    onClick={() => setDeleteConfirmation({ id: order.id })}
                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    title="Excluir Pedido"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Detalhes do Pedido #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
                <p><strong>WhatsApp:</strong> {selectedOrder.whatsapp}</p>
                <p><strong>Endereço:</strong> {selectedOrder.address || 'Retirada'}</p>
                <p><strong>Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Data:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedOrder.fullDetails.map((item, idx) => {
                    // Get option names for this item
                    const selectedOptionsText: string[] = [];
                    Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
                      if ((qty as number) > 0) {
                        for (const group of groups) {
                          const option = group.options.find(opt => opt.id === optionId);
                          if (option) {
                            selectedOptionsText.push(`+ ${option.name} (${qty}x)`);
                            break;
                          }
                        }
                      }
                    });

                    return (
                      <div key={idx} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                        {selectedOptionsText.length > 0 && (
                          <div className="ml-4 mt-1">
                            {selectedOptionsText.map((opt, optIdx) => (
                              <p key={optIdx} className="text-xs text-gray-600">{opt}</p>
                            ))}
                          </div>
                        )}
                        {item.note && <p className="text-xs text-blue-600 ml-4 mt-1 italic">Obs: {item.note}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => handlePrintOrder(selectedOrder)} className="flex-1 bg-gray-200 py-3 rounded font-bold flex items-center justify-center gap-2">
                <Printer size={20} /> Imprimir
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-purple-600 text-white py-3 rounded font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmation}
        title="Excluir Pedido"
        message="Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (deleteConfirmation) {
            deleteOrder(deleteConfirmation.id);
            setDeleteConfirmation(null);
          }
        }}
        onCancel={() => setDeleteConfirmation(null)}
        isDestructive
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

const CouponsPage = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; code: string } | null>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!editingCoupon.code || !editingCoupon.value) return;

    try {
      if (editingCoupon.id) {
        await updateCoupon(editingCoupon as Coupon);
      } else {
        // Remover ID para deixar o banco gerar (se for UUID) ou passar um ID temporário se a lógica local exigir
        // Como o addCoupon no AppProvider usa o objeto passado, e o banco gera UUID, 
        // passar um ID numérico (Date.now) pode causar erro de sintaxe UUID se o campo for UUID.
        // Vamos remover o ID do objeto passado para criação.
        const { id, ...newCoupon } = editingCoupon;
        await addCoupon({ ...newCoupon, active: true, usageCount: 0 } as Coupon);
      }
      setIsModalOpen(false);
      // Force reload to show new coupon
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom. Verifique se o código já existe.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      await deleteCoupon(deleteConfirmation.id);
      setDeleteConfirmation(null);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Cupons</h1>
        </div>
        <button onClick={() => { setEditingCoupon({ type: 'percent' }); setIsModalOpen(true); }} className="bg-purple-600 text-white p-2 rounded-full"><Plus /></button>
      </div>

      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{c.code}</p>
              <p className="text-sm text-gray-500">{c.type === 'percent' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}</p>
              {c.minOrderValue && <p className="text-xs text-gray-400">Pedido mín: R$ {c.minOrderValue.toFixed(2)}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateCoupon({ ...c, active: !c.active })} className={`transition-colors ${c.active ? 'text-green-500' : 'text-gray-300'}`}>
                <ToggleLeft size={28} className={`transition-transform ${c.active ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => { setEditingCoupon(c); setIsModalOpen(true); }} className="text-gray-400"><Edit size={18} /></button>
              <button onClick={() => setDeleteConfirmation({ id: c.id, code: c.code })} className="text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">{editingCoupon.id ? 'Editar' : 'Novo'} Cupom</h3>
            <input
              className="w-full border p-2 rounded uppercase" placeholder="CÓDIGO"
              value={editingCoupon.code || ''} onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'percent' })} className={`flex-1 py-2 border rounded ${editingCoupon.type === 'percent' ? 'bg-purple-50 border-purple-500' : ''}`}>%</button>
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'fixed' })} className={`flex-1 py-2 border rounded ${editingCoupon.type === 'fixed' ? 'bg-purple-50 border-purple-500' : ''}`}>R$</button>
            </div>
            <input
              type="number" className="w-full border p-2 rounded" placeholder="Valor"
              value={editingCoupon.value || ''} onChange={e => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="Valor Mínimo do Pedido (opcional)"
              value={editingCoupon.minOrderValue || ''}
              onChange={e => setEditingCoupon({ ...editingCoupon, minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Salvar</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmation}
        title="Excluir Cupom"
        message={`Tem certeza que deseja excluir o cupom "${deleteConfirmation?.code}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation(null)}
        isDestructive
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

const AddonsPage = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: ProductOption | null } | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Partial<ProductGroup>>({});

  const handleAddGroup = () => {
    setEditingGroup({
      id: Date.now().toString(),
      title: '',
      min: 1,
      max: 1,
      options: []
    });
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup({ ...group });
    setIsModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!editingGroup || !editingGroup.title) return;

    const existingGroup = groups.find(g => g.id === editingGroup.id);
    if (existingGroup) {
      updateGroup(editingGroup);
    } else {
      addGroup(editingGroup);
    }
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este grupo?')) {
      deleteGroup(id);
    }
  };

  const handleAddOption = (groupId: string) => {
    setEditingOption({
      groupId,
      option: {
        id: Date.now().toString(),
        name: '',
        price: 0,
        description: ''
      }
    });
  };

  const handleEditOption = (groupId: string, option: ProductOption) => {
    setEditingOption({
      groupId,
      option: { ...option }
    });
  };

  const handleSaveOption = () => {
    if (!editingOption || !editingOption.option || !editingOption.option.name) return;

    const group = groups.find(g => g.id === editingOption.groupId);
    if (!group) return;

    const existingOptionIndex = group.options.findIndex(o => o.id === editingOption.option!.id);
    let updatedOptions;

    if (existingOptionIndex >= 0) {
      updatedOptions = [...group.options];
      updatedOptions[existingOptionIndex] = editingOption.option;
    } else {
      updatedOptions = [...group.options, editingOption.option];
    }

    updateGroup({ ...group, options: updatedOptions });
    setEditingOption(null);
  };

  const handleDeleteOption = (groupId: string, optionId: string) => {
    if (confirm('Tem certeza que deseja deletar esta opção?')) {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const updatedOptions = group.options.filter(o => o.id !== optionId);
      updateGroup({ ...group, options: updatedOptions });
    }
  };

  const handleInlineEdit = (group: ProductGroup) => {
    setInlineEditId(group.id);
    setInlineEditData({ ...group });
  };

  const handleInlineSave = () => {
    if (!inlineEditData.title || !inlineEditData.min || !inlineEditData.max) {
      alert('Preencha todos os campos');
      return;
    }
    updateGroup(inlineEditData as ProductGroup);
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
          <h1 className="text-xl font-bold">Adicionais / Combos</h1>
        </div>
        <button
          onClick={handleAddGroup}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} /> Novo Grupo
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {inlineEditId === group.id ? (
              <div className="p-4 border-b border-gray-100">
                <div className="space-y-3">
                  <input
                    className="w-full border p-2 rounded font-bold text-lg"
                    placeholder="Título do Grupo"
                    value={inlineEditData.title || ''}
                    onChange={e => setInlineEditData({ ...inlineEditData, title: e.target.value })}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      placeholder="Min"
                      value={inlineEditData.min || ''}
                      onChange={e => setInlineEditData({ ...inlineEditData, min: parseInt(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      placeholder="Max"
                      value={inlineEditData.max || ''}
                      onChange={e => setInlineEditData({ ...inlineEditData, max: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleInlineSave}
                      className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-bold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle size={16} /> Salvar
                    </button>
                    <button
                      onClick={handleInlineCancel}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded font-bold flex items-center gap-1"
                    >
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{group.title}</h3>
                  <p className="text-sm text-gray-500">
                    Min: {group.min} | Max: {group.max} | {group.options.length} opções
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInlineEdit(group)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar Rápido"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Ver Opções"
                  >
                    {expandedGroup === group.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar Completo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {expandedGroup === group.id && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-700">Opções</h4>
                  <button
                    onClick={() => handleAddOption(group.id)}
                    className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:text-purple-700"
                  >
                    <Plus size={16} /> Adicionar Opção
                  </button>
                </div>
                <div className="space-y-2">
                  {group.options.map(option => (
                    <div key={option.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{option.name}</p>
                        {option.description && (
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        )}
                        <p className="text-sm text-green-600 font-bold mt-1">
                          + R$ {option.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditOption(group.id, option)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(group.id, option.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {group.options.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Nenhuma opção adicionada</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum grupo criado ainda</p>
            <button
              onClick={handleAddGroup}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {groups.find(g => g.id === editingGroup.id) ? 'Editar Grupo' : 'Novo Grupo'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título do Grupo"
                value={editingGroup.title}
                onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={editingGroup.min}
                    onChange={e => setEditingGroup({ ...editingGroup, min: parseInt(e.target.value) || 0 })}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={editingGroup.max}
                    onChange={e => setEditingGroup({ ...editingGroup, max: parseInt(e.target.value) || 0 })}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setIsModalOpen(false); setEditingGroup(null); }}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGroup}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {editingOption && editingOption.option && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {groups.find(g => g.id === editingOption.groupId)?.options.find(o => o.id === editingOption.option!.id)
                ? 'Editar Opção'
                : 'Nova Opção'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome da Opção"
                value={editingOption.option.name}
                onChange={e => setEditingOption({
                  ...editingOption,
                  option: { ...editingOption.option!, name: e.target.value }
                })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={editingOption.option.description || ''}
                onChange={e => setEditingOption({
                  ...editingOption,
                  option: { ...editingOption.option!, description: e.target.value }
                })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Adicional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editingOption.option.price || ''}
                  onChange={e => setEditingOption({
                    ...editingOption,
                    option: { ...editingOption.option!, price: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingOption(null)}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveOption}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const { settings, updateSettings, checkStoreStatus } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropModalData, setCropModalData] = useState<{ imageUrl: string; field: 'logoUrl' | 'bannerUrl'; aspectRatio: number } | null>(null);

  const handleSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `store-assets/${Date.now()}.${fileExt}`;
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

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const aspectRatio = field === 'logoUrl' ? 1 : 16 / 9;
      setCropModalData({ imageUrl, field, aspectRatio });
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!cropModalData) return;

    const publicUrl = await uploadImageToSupabase(croppedFile);
    if (publicUrl) {
      updateSettings({ [cropModalData.field]: publicUrl });
    }
    setCropModalData(null);
  };

  const handleHourChange = (dayOfWeek: number, field: 'open' | 'close' | 'enabled', value: string | boolean) => {
    const updatedHours = settings.openingHours.map(h =>
      h.dayOfWeek === dayOfWeek
        ? { ...h, [field]: value }
        : h
    );
    updateSettings({ openingHours: updatedHours });
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="space-y-4">
        {/* Manual Store Control */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ToggleLeft size={20} /> Controle da Loja
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSettings({ storeStatus: 'open' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${settings.storeStatus === 'open' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">ABERTO</span>
                <span className="text-[10px] opacity-75">(Forçar)</span>
              </button>

              <button
                onClick={() => updateSettings({ storeStatus: 'closed' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${settings.storeStatus === 'closed' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'closed' ? 'bg-red-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">FECHADO</span>
                <span className="text-[10px] opacity-75">(Forçar)</span>
              </button>

              <button
                onClick={() => updateSettings({ storeStatus: 'auto' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${settings.storeStatus === 'auto' || !settings.storeStatus ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'auto' || !settings.storeStatus ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">AUTO</span>
                <span className="text-[10px] opacity-75">(Horários)</span>
              </button>
            </div>

            <div className="text-center p-2 rounded bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500">
                Status Atual: <strong className={checkStoreStatus() === 'open' ? 'text-green-600' : 'text-red-600'}>
                  {checkStoreStatus() === 'open' ? '🟢 ABERTO AGORA' : '🔴 FECHADO AGORA'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Mode Control */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={20} /> Modo de Entrega
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Apenas Retirada na Loja</p>
                <p className="text-xs text-gray-500">Desativar entregas (somente pickup)</p>
              </div>
              <button
                onClick={() => updateSettings({ deliveryOnly: !settings.deliveryOnly })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.deliveryOnly ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.deliveryOnly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            {settings.deliveryOnly && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-center">
                <span className="text-sm font-medium text-orange-700">⚠️ Entregas desativadas - Apenas retirada</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={20} /> Horários de Funcionamento
          </h3>
          <p className="text-xs text-gray-500 mb-4">Configure os horários automáticos de abertura e fechamento</p>
          <div className="space-y-3">
            {settings.openingHours.map((hour) => (
              <div key={hour.dayOfWeek} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{dayNames[hour.dayOfWeek]}</span>
                  <button
                    onClick={() => handleHourChange(hour.dayOfWeek, 'enabled', !hour.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hour.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hour.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
                {hour.enabled && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Abertura</label>
                      <input
                        type="time"
                        value={hour.open}
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'open', e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Fechamento</label>
                      <input
                        type="time"
                        value={hour.close}
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'close', e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                )}
                {!hour.enabled && (
                  <p className="text-xs text-gray-400 italic mt-1">Fechado neste dia</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-4"
          >
            Salvar Configurações
          </button>
        </div>

        {/* Logo Upload */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Logo da Loja</label>

          {/* Shape Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">Formato do Logo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ logoShape: 'circle' })}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${settings.logoShape === 'circle'
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${settings.logoShape === 'circle' ? 'border-purple-500' : 'border-gray-300'
                  }`} />
                <span className="text-xs font-bold">Círculo</span>
              </button>
              <button
                onClick={() => updateSettings({ logoShape: 'rectangle' })}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${settings.logoShape === 'rectangle'
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-lg border-2 ${settings.logoShape === 'rectangle' ? 'border-purple-500' : 'border-gray-300'
                  }`} />
                <span className="text-xs font-bold">Retângulo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={settings.logoUrl} className={`w-20 h-20 object-cover border ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} alt="Logo" />
              <button
                onClick={() => {
                  if (confirm('Remover logo da loja?')) {
                    updateSettings({ logoUrl: '' });
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                type="button"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <label className={`flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded border border-dashed flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={18} /> <span className="text-sm">{isUploading ? 'Enviando...' : 'Alterar Logo'}</span>
              <input type="file" accept="image/*" hidden onChange={e => handleImage(e, 'logoUrl')} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* Cover Photo Upload */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Capa / Banner</label>
          <div className="space-y-3">
            {settings.bannerUrl && (
              <div className="relative">
                <img src={settings.bannerUrl} className="w-full h-32 rounded object-cover border" alt="Banner" />
                <button
                  onClick={() => {
                    if (confirm('Remover foto de capa?')) {
                      updateSettings({ bannerUrl: '' });
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
              <Upload size={18} /> <span className="text-sm">{isUploading ? 'Enviando...' : 'Alterar Foto de Capa'}</span>
              <input type="file" accept="image/*" hidden onChange={e => handleImage(e, 'bannerUrl')} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* Store Name */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Loja</label>
          <input
            className="w-full border p-2 rounded"
            value={settings.storeName}
            onChange={e => updateSettings({ storeName: e.target.value })}
          />
        </div>

        {/* WhatsApp */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp (com código do país)</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="5594999999999"
            value={settings.whatsappNumber}
            onChange={e => updateSettings({ whatsappNumber: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Exemplo: 5594992816973</p>
        </div>

        {/* Delivery Fee */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Taxa de Entrega (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full border p-2 rounded"
            value={settings.deliveryFee}
            onChange={e => updateSettings({ deliveryFee: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Save Confirmation Toast */}
      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-bold">Configurações Salvas!</span>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalData && (
        <ImageCropModal
          imageUrl={cropModalData.imageUrl}
          aspectRatio={cropModalData.aspectRatio}
          onComplete={handleCropComplete}
          onCancel={() => setCropModalData(null)}
          title={cropModalData.field === 'logoUrl' ? 'Recortar Logo' : 'Recortar Capa'}
        />
      )}
    </div>
  );
};



const ThemeSettingsPage = () => {
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const colors = [
    { key: 'headerBg', label: 'Fundo do Cabeçalho', default: '#4E0797' },
    { key: 'headerText', label: 'Texto do Cabeçalho', default: '#ffffff' },
    { key: 'background', label: 'Fundo da Página', default: '#f6f6f6' },
    { key: 'cardBg', label: 'Fundo dos Cards', default: '#ffffff' },
    { key: 'cardText', label: 'Texto dos Cards', default: '#333333' },
    { key: 'buttonPrimary', label: 'Botão Principal', default: '#e50914' },
    { key: 'buttonText', label: 'Texto do Botão', default: '#ffffff' },
    { key: 'textPrimary', label: 'Texto Principal', default: '#1e1e1e' },
    { key: 'textSecondary', label: 'Texto Secundário', default: '#666666' },
  ];

  const handleColorChange = (key: string, value: string) => {
    const currentTheme = settings.themeColors || {};
    updateSettings({
      themeColors: {
        ...currentTheme,
        [key]: value
      }
    });
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar as cores padrão?')) {
      updateSettings({ themeColors: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Cores do Site</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Palette size={20} /> Personalizar Cores
          </h3>
          <button
            onClick={handleReset}
            className="text-sm text-red-600 font-bold hover:underline"
          >
            Restaurar Padrão
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colors.map(color => {
            const currentValue = (settings.themeColors as any)?.[color.key] || color.default;
            return (
              <div key={color.key} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="color"
                  value={currentValue}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700">{color.label}</label>
                  <span className="text-xs text-gray-500 uppercase">{currentValue}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-6"
        >
          Salvar Alterações
        </button>
      </div>

      {/* Preview Box */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Pré-visualização</h3>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: (settings.themeColors as any)?.background || '#f6f6f6' }}
        >
          <div
            className="p-3 rounded-lg mb-3 text-center shadow-sm"
            style={{
              backgroundColor: (settings.themeColors as any)?.headerBg || 'var(--color-header-bg)',
              color: (settings.themeColors as any)?.headerText || 'var(--color-header-text)'
            }}
          >
            Cabeçalho Exemplo
          </div>
          <div
            className="p-4 rounded-lg shadow-sm"
            style={{
              backgroundColor: (settings.themeColors as any)?.cardBg || 'var(--color-card-bg)',
              color: (settings.themeColors as any)?.cardText || 'var(--color-card-text)'
            }}
          >
            <h4 style={{ color: (settings.themeColors as any)?.textPrimary || 'var(--color-text-primary)' }} className="font-bold mb-2">Título do Card</h4>
            <p style={{ color: (settings.themeColors as any)?.textSecondary || 'var(--color-text-secondary)' }} className="text-sm mb-3">Este é um exemplo de texto secundário no card.</p>
            <button
              className="px-4 py-2 rounded font-bold text-sm w-full"
              style={{
                backgroundColor: (settings.themeColors as any)?.buttonPrimary || 'var(--color-button-primary)',
                color: (settings.themeColors as any)?.buttonText || 'var(--color-button-text)'
              }}
            >
              Botão de Ação
            </button>
          </div>
        </div>
      </div>

      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-bold">Configurações Salvas!</span>
        </div>
      )}
    </div>
  );
};

const ExitModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <LogOut size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sair do Aplicativo?</h3>
          <p className="text-gray-500 mb-6">Tem certeza que deseja fechar o aplicativo?</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              CANCELAR
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              SAIR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const AppContent = () => {
  const {
    categories, addCategory, updateCategory, deleteCategory,
    products, addProduct, updateProduct, deleteProduct,
    groups, orders, loading
  } = useApp();



  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/panel');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const handleBackButton = async () => {
      if (location.pathname === '/') {
        setShowExitModal(true);
      } else {
        navigate(-1);
      }
    };

    const listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, [location, navigate]);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-purple">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
        <p className="text-white text-lg font-bold animate-pulse">Carregando Obba Açaí...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pb-0">
      <ExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/panel" element={<AdminPanel />} />
        <Route path="/panel/orders" element={<OrdersPage />} />
        <Route path="/panel/coupons" element={<CouponsPage />} />
        <Route path="/panel/addons" element={<AddonsPage />} />
        <Route path="/panel/settings" element={<SettingsPage />} />
        <Route path="/panel/theme" element={<ThemeSettingsPage />} />
        <Route path="/panel/inventory" element={<InventoryPage products={products} />} />
        <Route path="/panel/printer" element={<PrinterSettingsPage />} />
        <Route path="/panel/theme" element={<ThemeSettingsPage />} />

        <Route path="/panel/categories" element={
          <CategoriesPage
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
        } />

        <Route path="/panel/products" element={
          <ProductsPage
            products={products}
            categories={categories}
            groups={groups}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
          />
        } />

        <Route path="/panel/reports" element={
          <ReportsPage orders={orders} />
        } />

        <Route path="/panel/inventory" element={
          <InventoryPage products={products} />
        } />
      </Routes>

      {!isAdminRoute && <Sidebar />}
      {!isAdminRoute && <FloatingCartButton />}
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h1>
          <p className="text-gray-600 mb-4">Ocorreu um erro inesperado na aplicação.</p>
          <pre className="bg-gray-200 p-4 rounded text-xs text-left overflow-auto max-w-full mb-6">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <AppProvider>
      <PrinterProvider>
        <ErrorBoundary>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </ErrorBoundary>
      </PrinterProvider>
    </AppProvider>
  );
};

export default App;
