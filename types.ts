
export interface ProductOption {
  id: string;
  name: string;
  price?: number;
  description?: string;
  active?: boolean; // Toggle for emergency deactivation
}

export interface ProductGroup {
  id: string;
  title: string;
  min: number;
  max: number;
  options: ProductOption[];
  active?: boolean; // Toggle for emergency deactivation
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  categoryId: string;
  groupIds?: string[]; // IDs of ProductGroups attached to this product
  displayOrder?: number; // Order for sorting products within category
  active?: boolean; // Toggle for emergency deactivation
}

export interface Category {
  id: string;
  title: string;
  icon?: string;
  displayOrder?: number;
  active?: boolean; // Toggle for emergency deactivation
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  selectedOptions: Record<string, number>; // optionId -> quantity
  note?: string;
  totalPrice: number;
}

export enum DeliveryMethod {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

// Internal Order Record for Admin Panel
export type OrderStatus = 'pending' | 'preparing' | 'delivery' | 'completed' | 'cancelled';

export interface OrderRecord {
  id: string;
  date: string; // ISO String
  customerName: string;
  whatsapp: string;
  method: DeliveryMethod;
  address?: string; // Formatted address string
  paymentMethod: string;
  total: number;
  itemsSummary: string; // Short summary for list view
  fullDetails: CartItem[]; // Full cart for re-printing
  status: OrderStatus;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  active: boolean;
  usageCount: number;
  minOrderValue?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface StockItem {
  id: string;
  productId: string; // Link to Product
  quantity: number;
  minQuantity: number; // Alert threshold
  supplierId?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  supplierId: string;
  items: { productId: string; quantity: number; cost: number }[];
  total: number;
  notes?: string;
}

export interface OpeningHour {
  dayOfWeek: number; // 0 = Sunday
  open: string; // HH:MM
  close: string; // HH:MM
  enabled: boolean;
}

export interface ThemeColors {
  headerBg: string;      // Cor de fundo dos cabeçalhos
  headerText: string;    // Cor do texto dos cabeçalhos
  background: string;    // Cor de fundo geral
  cardBg: string;        // Cor de fundo dos cards/painéis
  cardText: string;      // Cor do texto nos cards
  buttonPrimary: string; // Cor dos botões primários
  buttonText: string;    // Cor do texto dos botões
  textPrimary: string;   // Cor do texto principal
  textSecondary: string; // Cor do texto secundário
}

export interface GlobalSettings {
  storeName: string;
  logoUrl: string;
  logoShape: 'circle' | 'rectangle';
  bannerUrl: string;
  whatsappNumber: string;
  storeStatus: 'open' | 'closed' | 'auto';
  deliveryFee: number;
  openingHours: OpeningHour[];
  deliveryOnly: boolean; // true = only pickup, false = delivery available
  themeColors?: ThemeColors; // Configurações de cores do tema
  closedMessage?: string; // Mensagem quando a loja está fechada
  openMessage?: string; // Mensagem quando a loja está aberta
}

export type Role = 'admin' | 'employee' | null;