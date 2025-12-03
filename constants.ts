
import { Category, Product, ProductGroup, Coupon, OrderRecord, DeliveryMethod } from './types';

export const WHATSAPP_NUMBER = "5594992816973";
export const LOGO_URL = "https://webservice.zapermenu.com.br/api/storage/public/logo/deIOsQ57EB9KTMCSw7CLVlBqoRuSRwScbXf4diCO.png";

export const CATEGORIES: Category[] = [
  { id: 'batidas', title: 'Batidas', icon: '🍹' },
  { id: 'acai_copo', title: 'Açaí no Copo', icon: '💜' },
  { id: 'barca', title: 'Barca de Açaí', icon: '🛶' },
  { id: 'marmita', title: 'Marmita de Açaí', icon: '🥡' },
  { id: 'crepe', title: 'Crepe Cone', icon: '😋' },
  { id: 'dogao', title: 'Dogão', icon: '🌭' },
  { id: 'bebidas', title: 'Bebidas', icon: '🥤' },
];

export const GROUPS: ProductGroup[] = [
  {
    id: 'adicionais_acai',
    title: 'Turbine seu Açaí',
    min: 0,
    max: 5,
    options: [
      { id: 'leite_cond', name: 'Leite Condensado' },
      { id: 'leite_po', name: 'Leite em Pó' },
      { id: 'granola', name: 'Granola' },
      { id: 'pacoca', name: 'Paçoca' },
      { id: 'morango', name: 'Morango', price: 3.00 },
      { id: 'banana', name: 'Banana' },
      { id: 'kiwi', name: 'Kiwi', price: 3.00 },
      { id: 'disquete', name: 'Disquete' },
      { id: 'chocoball', name: 'Chocoball' },
      { id: 'nutella', name: 'Creme de Avelã', price: 5.00 },
    ]
  },
  {
    id: 'recheio_crepe',
    title: 'Escolha o Recheio',
    min: 1,
    max: 1,
    options: [
      { id: 'frango_catupiry', name: 'Frango com Catupiry' },
      { id: 'presunto_queijo', name: 'Presunto e Queijo' },
      { id: 'calabresa_queijo', name: 'Calabresa e Queijo' },
      { id: 'bacon_queijo', name: 'Bacon com Queijo' },
      { id: 'carne_seca', name: 'Carne Seca com Requeijão' },
    ]
  },
  {
    id: 'montar_acai',
    title: 'Escolha até 3 Ingredientes',
    min: 0,
    max: 3,
    options: [
      { id: 'leite_cond', name: 'Leite Condensado' },
      { id: 'leite_po', name: 'Leite em Pó' },
      { id: 'granola', name: 'Granola' },
      { id: 'pacoca', name: 'Paçoca' },
      { id: 'banana', name: 'Banana' },
      { id: 'amendoim', name: 'Amendoim' },
    ]
  },
  {
    id: 'combos_obba_options',
    title: 'Escolha seu Combo',
    min: 1,
    max: 15,
    options: [
      { id: 'obba_beijinho', name: 'OBBA BEIJINHO', description: 'Açaí, Banana, Leite Condensado e Beijinho' },
      { id: 'obba_biscoito', name: 'OBBA BISCOITO', description: 'Açaí, Calda de Chocolate, Chantilly e Biscoito' },
      { id: 'obba_black_white', name: 'OBBA BLACK WHITE', description: 'Açaí, Creme de Cupuaçu, Banana e Granola' },
      { id: 'obba_bombom', name: 'OBBA BOMBOM', description: 'Açaí, Bombom, Amendoim e Chantilly' },
      { id: 'obba_brigadeiro', name: 'OBBA BRIGADEIRO', description: 'Açaí, Brigadeiro, Chantilly e Calda de Chocolate' },
      { id: 'obba_chocoball', name: 'OBBA CHOCABALL', description: 'Açaí, Chocoball, Leite Condensado e Creme de Ninho' },
      { id: 'obba_doce_leite', name: 'OBBA DOCE DE LEITE', description: 'Açaí, Doce de Leite, Amendoim e Banana' },
      { id: 'obba_fit', name: 'OBBA FIT', description: 'Açaí, Morango, Kiwi, Banana, Granola e Mel' },
      { id: 'obba_floresta_negra', name: 'OBBA FLORESTA NEGRA', description: 'Açaí, Creme de Cupuaçu, Raspa de Chocolate e Cereja' },
      { id: 'obba_frutas', name: 'OBBA FRUTAS', description: 'Açaí, Morango, Banana, Kiwi, Abacaxi e Manga' },
      { id: 'obba_ice', name: 'OBBA ICE', description: 'Açaí, Sorvete, Chantilly e Gotas de Chocolate' },
      { id: 'obba_kids', name: 'OBBA KIDS', description: 'Açaí, Leite Condensado, Confetes e Bis' },
      { id: 'obba_kitkat', name: 'OBBA KITKAT', description: 'Açaí, Creme de Ninho, Kitkat e Cereja' },
      { id: 'obba_lactea', name: 'OBBA LACTEA', description: 'Açaí, Farinha Láctea, Granola e Banana' },
      { id: 'obba_limao', name: 'OBBA LIMÃO', description: 'Açaí, Mousse de Limão, Leite em Pó e Kiwi' },
      { id: 'obba_love', name: 'OBBA LOVE', description: 'Açaí, Creme de Morango, Leite em Pó e Morango' },
      { id: 'obba_magnifico', name: 'OBBA MAGNÍFICO', description: 'Açaí, Creme de Avelã, Leite em Pó e Banana' },
      { id: 'obba_maltine', name: 'OBBA MALTINE', description: 'Açaí, Ovomaltine, Leite Condensado e Morango' },
      { id: 'obba_maracuja', name: 'OBBA MARACUJÁ', description: 'Açaí, Mousse de Maracujá, Gotas de Chocolate e Creme de Avelã' },
      { id: 'obba_mousse', name: 'OBBA MOUSSE', description: 'Açaí, Mousse de Maracujá, Leite em Pó e Banana' },
      { id: 'obba_neston', name: 'OBBA NESTON', description: 'Açaí, Neston, Leite em Pó e Banana' },
      { id: 'obba_ninho', name: 'OBBA NINHO', description: 'Açaí, Leite Condensado, Banana, Leite em Pó e Morango' },
      { id: 'obba_premium', name: 'OBBA PREMIUM', description: 'Açaí, Leitinho, Mousse de Limão e Biscoito de Limão' },
      { id: 'obba_salada_frutas', name: 'OBBA SALADA DE FRUTAS', description: 'Frutas Diversas, Leite Condensado e Farinha Láctea' },
      { id: 'obba_tentacao', name: 'OBBA TENTAÇÃO', description: 'Açaí, Raspa de Chocolate Ao Leite, Raspa de Chocolate Branco e Morango' },
      { id: 'obba_tradicional', name: 'OBBA TRADICIONAL', description: 'Açaí, Granola, Leite em Pó e Leite' },
      { id: 'obba_tropical', name: 'OBBA TROPICAL', description: 'Açaí, Abacaxi, Banana, Uva e Leite Condensado' },
      { id: 'obba_uva', name: 'OBBA UVA', description: 'Açaí, Mousse de Uva, Leite em Pó e Uva' },
      { id: 'obba_white', name: 'OBBA WHITE', description: 'Açaí, Maracujá, Leitinho e Raspa Branca' },
      { id: 'obba_turbinado', name: 'OBBA TURBINADO', description: 'Açaí, Chantilly, Maracujá e Maltine' },
      { id: 'obba_supremo', name: 'OBBA SUPREMO', description: 'Açaí, creme de morango, avelã, morango e maltine' },
      { id: 'obba_delicia', name: 'OBBA DELÍCIA', description: 'Açaí, cereal, leite em pó, banana e uva' },
      { id: 'obba_pacoca', name: 'OBBA PAÇOCA', description: 'Açaí, amendoim, leite condensado, paçoca e banana' },
      { id: 'obba_ouro', name: 'OBBA OURO', description: 'Açaí, creme de cookies, bombom ouro branco e cereal' },
      { id: 'obba_ninhotella', name: 'OBBA NINHOTELLA', description: 'Açaí, creme de ninho, creme de avelã, banana e uva' },
      { id: 'obba_cookies', name: 'OBBA COOKIES', description: 'Açaí, biscoito de cookies, leite em pó, e creme de cookies' },
      { id: 'obba_pistache', name: 'OBBA PISTACHE', description: 'Açaí, creme de avelã, creme de pistache, banana e amendoim' },
      { id: 'obba_explosao', name: 'OBBA EXPLOSÃO', description: 'Açaí, creme de avelã, creme de ninho, bolas de chocolate e banana' },
      { id: 'obba_diversao', name: 'OBBA DIVERSÃO', description: 'Açaí, leite em pó, leite condensado, disquete e banana' },
      { id: 'obba_sensacao', name: 'OBBA SENSAÇÃO', description: 'Açaí, disquete, chocoball, banana e leite condensado' },
      { id: 'obba_felicidade', name: 'OBBA FELICIDADE', description: 'Açaí, creme de cookies, batom de chocolate, creme de avelã e chocoball' },
    ]
  }
];

const IMAGES = {
  batida: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?auto=format&fit=crop&w=400&q=80',
  acai_copo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80',
  barca: 'https://images.unsplash.com/photo-1623594917954-46c596355812?auto=format&fit=crop&w=400&q=80',
  marmita: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=400&q=80',
  crepe: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=400&q=80',
  dogao: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=400&q=80',
  coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
  soda_orange: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=300&q=80',
  soda_grape: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=300&q=80&hue=270',
  water: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=300&q=80',
};

export const PRODUCTS: Product[] = [
  // --- Batidas ---
  { id: 'bat_trad', categoryId: 'batidas', name: 'Batida Tradicional', description: 'Leite Condensado e Leite em Pó', price: 18.00, image: IMAGES.batida },
  { id: 'bat_mousse', categoryId: 'batidas', name: 'Batida de Mousse de Maracujá', price: 18.00, image: IMAGES.batida },
  { id: 'bat_cupuacu', categoryId: 'batidas', name: 'Batida de Creme de Cupuaçu', price: 18.00, image: IMAGES.batida },
  { id: 'bat_ovomaltine', categoryId: 'batidas', name: 'Batida de Ovomaltine', price: 18.00, image: IMAGES.batida },
  { id: 'bat_cookies', categoryId: 'batidas', name: 'Batida de Choco Cookies', price: 18.00, image: IMAGES.batida },
  { id: 'bat_mix', categoryId: 'batidas', name: 'Batida Mix (2 Sabores)', price: 18.00, image: IMAGES.batida },
  { id: 'bat_morango', categoryId: 'batidas', name: 'Batida de Mousse de Morango', price: 18.00, image: IMAGES.batida },
  { id: 'bat_ninho', categoryId: 'batidas', name: 'Batida de Creme de Ninho', price: 18.00, image: IMAGES.batida },
  { id: 'bat_pistache', categoryId: 'batidas', name: 'Batida de Pistache', description: 'Leite Condensado e Amendoim', price: 18.00, image: IMAGES.batida },
  { id: 'bat_avela', categoryId: 'batidas', name: 'Batida de Creme de Avelã', price: 18.00, image: IMAGES.batida },

  // --- Açaí Copo ---
  { id: 'acai_300', categoryId: 'acai_copo', name: 'Açaí Copo 300ml', price: 13.00, image: IMAGES.acai_copo, groupIds: ['combos_obba_options', 'adicionais_acai'] },
  { id: 'acai_400', categoryId: 'acai_copo', name: 'Açaí Copo 400ml', price: 17.00, image: IMAGES.acai_copo, groupIds: ['combos_obba_options', 'adicionais_acai'] },
  { id: 'acai_500', categoryId: 'acai_copo', name: 'Açaí Copo 500ml', price: 20.00, image: IMAGES.acai_copo, groupIds: ['combos_obba_options', 'adicionais_acai'] },
  { id: 'monte_300', categoryId: 'acai_copo', name: 'Obba Monte o Seu - 300ml', description: 'Escolha até 3 Ingredientes', price: 13.00, image: IMAGES.acai_copo, groupIds: ['montar_acai'] },
  { id: 'monte_400', categoryId: 'acai_copo', name: 'Obba Monte o Seu - 400ml', description: 'Escolha até 3 Ingredientes', price: 17.00, image: IMAGES.acai_copo, groupIds: ['montar_acai'] },
  { id: 'monte_500', categoryId: 'acai_copo', name: 'Obba Monte o Seu - 500ml', description: 'Escolha até 3 Ingredientes', price: 20.00, image: IMAGES.acai_copo, groupIds: ['montar_acai'] },

  // --- Barca ---
  { id: 'barca_15', categoryId: 'barca', name: 'Barca de Açaí 1,5L', description: 'Escolha os Acompanhamentos', price: 65.00, image: IMAGES.barca, groupIds: ['adicionais_acai'] },

  // --- Marmita ---
  { id: 'marmita_750', categoryId: 'marmita', name: 'Marmita de Açaí 750ml', description: 'Escolha os Acompanhamentos', price: 35.00, image: IMAGES.marmita, groupIds: ['adicionais_acai'] },

  // --- Crepe ---
  { id: 'crepe_cone', categoryId: 'crepe', name: 'Crepe Cone', description: 'Escolha o Recheio 😋', price: 18.00, image: IMAGES.crepe, groupIds: ['recheio_crepe'] },

  // --- Dogão ---
  { id: 'dog_calabresa', categoryId: 'dogao', name: 'Dogão Calabresa', description: 'Salsicha, Calabresa, Queijo Ralado, Cenoura...', price: 20.00, image: IMAGES.dogao },
  { id: 'dog_classico', categoryId: 'dogao', name: 'Dogão Clássico', description: 'Salsicha, Queijo Ralado, Presunto, Cenoura...', price: 18.00, image: IMAGES.dogao },
  { id: 'dog_bacon', categoryId: 'dogao', name: 'Dogão Bacon', description: 'Salsicha, Cheddar, Bacon, Queijo Ralado...', price: 20.00, image: IMAGES.dogao },
  { id: 'dog_super', categoryId: 'dogao', name: 'Dogão Super', description: '2x Salsicha, Queijo Ralado, Presunto Ralado...', price: 22.00, image: IMAGES.dogao },

  // --- Bebidas ---
  { id: 'agua', categoryId: 'bebidas', name: 'Agua Mineral 500ml', price: 4.00, image: IMAGES.water },
  { id: 'coca', categoryId: 'bebidas', name: 'Coca Cola Lata', price: 6.00, image: IMAGES.coke },
  { id: 'coca_zero', categoryId: 'bebidas', name: 'Coca Cola Zero Lata', price: 6.00, image: IMAGES.coke },
  { id: 'fanta_laranja', categoryId: 'bebidas', name: 'Fanta Laranja Lata', price: 6.00, image: IMAGES.soda_orange },
  { id: 'fanta_uva', categoryId: 'bebidas', name: 'Fanta Uva Lata', price: 6.00, image: IMAGES.soda_grape },
  { id: 'pepsi', categoryId: 'bebidas', name: 'Pepsi Lata', price: 6.00, image: IMAGES.coke },
  { id: 'pepsi_zero', categoryId: 'bebidas', name: 'Pepsi Zero Lata', price: 6.00, image: IMAGES.coke },
  { id: 'sprite', categoryId: 'bebidas', name: 'Sprite Lata', price: 6.00, image: IMAGES.water },
  { id: 'guarana_jesus', categoryId: 'bebidas', name: 'Guaraná Jesus Lata', price: 6.00, image: IMAGES.soda_grape },
];

export const PAYMENT_METHODS = [
  'Dinheiro',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Pix',
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'BEMVINDO', type: 'percent', value: 10, active: true, usageCount: 0 },
  { id: '2', code: 'ENTREGAFREE', type: 'fixed', value: 5, active: false, usageCount: 0 },
];

export const MOCK_ORDERS: OrderRecord[] = [
  { id: '1001', date: new Date(Date.now() - 86400000).toISOString(), customerName: 'João Silva', whatsapp: '9499999999', method: DeliveryMethod.DELIVERY, paymentMethod: 'Pix', total: 45.00, itemsSummary: '2x Açaí 300ml, 1x Coca', status: 'completed', address: 'Rua A, 123, Centro', fullDetails: [] },
  { id: '1002', date: new Date().toISOString(), customerName: 'Maria Oliveira', whatsapp: '9498888888', method: DeliveryMethod.PICKUP, paymentMethod: 'Dinheiro', total: 18.00, itemsSummary: '1x Crepe Cone', status: 'pending', address: '', fullDetails: [] },
  { id: '1003', date: new Date().toISOString(), customerName: 'Carlos Souza', whatsapp: '9497777777', method: DeliveryMethod.DELIVERY, paymentMethod: 'Cartão de Crédito', total: 65.00, itemsSummary: '1x Barca 1.5L', status: 'preparing', address: 'Av B, 500, Novo Horizonte', fullDetails: [] },
];
