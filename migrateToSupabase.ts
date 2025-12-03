import { supabase } from './supabaseClient';
import { Preferences } from '@capacitor/preferences';
import { PRODUCTS, CATEGORIES, GROUPS, INITIAL_COUPONS, MOCK_ORDERS } from './constants';
import type { Product, Category, ProductGroup, Coupon, OrderRecord } from './types';

/**
 * Script de migração de dados locais para Supabase
 * 
 * Execute este script UMA VEZ após configurar o Supabase
 * para transferir todos os dados do armazenamento local para o banco
 */

export const migrateDataToSupabase = async () => {
    console.log('🚀 Iniciando migração de dados para Supabase...\n');

    try {
        // 1. Migrar Categorias
        console.log('📂 Migrando categorias...');
        const { value: categoriesJSON } = await Preferences.get({ key: 'categories' });
        const localCategories: Category[] = categoriesJSON ? JSON.parse(categoriesJSON) : CATEGORIES;

        for (const cat of localCategories) {
            const { error } = await supabase
                .from('categories')
                .upsert([{ id: cat.id, title: cat.title, icon: cat.icon }], { onConflict: 'id' });

            if (error) console.error(`❌ Erro ao migrar categoria ${cat.title}:`, error.message);
            else console.log(`  ✅ ${cat.title}`);
        }

        // 2. Migrar Grupos de Opções
        console.log('\n🧩 Migrando grupos de opções...');
        const { value: groupsJSON } = await Preferences.get({ key: 'groups' });
        const localGroups: ProductGroup[] = groupsJSON ? JSON.parse(groupsJSON) : GROUPS;

        for (const group of localGroups) {
            // Inserir grupo
            const { error: groupError } = await supabase
                .from('product_groups')
                .upsert([{
                    id: group.id,
                    title: group.title,
                    min: group.min,
                    max: group.max
                }], { onConflict: 'id' });

            if (groupError) {
                console.error(`❌ Erro ao migrar grupo ${group.title}:`, groupError.message);
                continue;
            }

            // Inserir opções do grupo
            for (const option of group.options) {
                const { error: optionError } = await supabase
                    .from('product_options')
                    .upsert([{
                        id: option.id,
                        group_id: group.id,
                        name: option.name,
                        price: option.price || 0,
                        description: option.description
                    }], { onConflict: 'id' });

                if (optionError) {
                    console.error(`  ❌ Erro ao migrar opção ${option.name}:`, optionError.message);
                }
            }

            console.log(`  ✅ ${group.title} (${group.options.length} opções)`);
        }

        // 3. Migrar Produtos
        console.log('\n🍦 Migrando produtos...');
        const { value: productsJSON } = await Preferences.get({ key: 'products' });
        const localProducts: Product[] = productsJSON ? JSON.parse(productsJSON) : PRODUCTS;

        for (const product of localProducts) {
            // Inserir produto
            const { error: productError } = await supabase
                .from('products')
                .upsert([{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category_id: product.categoryId
                }], { onConflict: 'id' });

            if (productError) {
                console.error(`❌ Erro ao migrar produto ${product.name}:`, productError.message);
                continue;
            }

            // Inserir relações produto-grupo
            if (product.groupIds && product.groupIds.length > 0) {
                for (const groupId of product.groupIds) {
                    const { error: relationError } = await supabase
                        .from('product_group_relations')
                        .upsert([{
                            product_id: product.id,
                            group_id: groupId
                        }], { onConflict: 'product_id,group_id' });

                    if (relationError) {
                        console.error(`  ❌ Erro ao criar relação produto-grupo:`, relationError.message);
                    }
                }
            }

            console.log(`  ✅ ${product.name}`);
        }

        // 4. Migrar Cupons
        console.log('\n🎟️  Migrando cupons...');
        const { value: couponsJSON } = await Preferences.get({ key: 'coupons' });
        const localCoupons: Coupon[] = couponsJSON ? JSON.parse(couponsJSON) : INITIAL_COUPONS;

        for (const coupon of localCoupons) {
            const { error } = await supabase
                .from('coupons')
                .upsert([{
                    id: coupon.id,
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    active: coupon.active,
                    usage_count: coupon.usageCount || 0
                }], { onConflict: 'id' });

            if (error) console.error(`❌ Erro ao migrar cupom ${coupon.code}:`, error.message);
            else console.log(`  ✅ ${coupon.code} (${coupon.type})`);
        }

        // 5. Migrar Pedidos
        console.log('\n📦 Migrando pedidos...');
        const { value: ordersJSON } = await Preferences.get({ key: 'orders' });
        const localOrders: OrderRecord[] = ordersJSON ? JSON.parse(ordersJSON) : MOCK_ORDERS;

        for (const order of localOrders) {
            const { error } = await supabase
                .from('orders')
                .upsert([{
                    id: order.id,
                    date: order.date,
                    customer_name: order.customerName,
                    whatsapp: order.whatsapp,
                    method: order.method,
                    address: order.address,
                    payment_method: order.paymentMethod,
                    total: order.total,
                    items_summary: order.itemsSummary,
                    full_details: order.fullDetails,
                    status: order.status
                }], { onConflict: 'id' });

            if (error) console.error(`❌ Erro ao migrar pedido ${order.id}:`, error.message);
            else console.log(`  ✅ Pedido #${order.id.substring(0, 8)}`);
        }

        // 6. Migrar Configurações
        console.log('\n⚙️  Migrando configurações...');
        const { value: settingsJSON } = await Preferences.get({ key: 'settings' });

        if (settingsJSON) {
            const localSettings = JSON.parse(settingsJSON);
            const { error } = await supabase
                .from('settings')
                .update({
                    store_name: localSettings.storeName,
                    logo_url: localSettings.logoUrl,
                    banner_url: localSettings.bannerUrl,
                    whatsapp_number: localSettings.whatsappNumber,
                    store_status: localSettings.storeStatus,
                    delivery_fee: localSettings.deliveryFee,
                    delivery_only: localSettings.deliveryOnly,
                    opening_hours: localSettings.openingHours
                })
                .eq('id', 1);

            if (error) console.error('❌ Erro ao migrar configurações:', error.message);
            else console.log('  ✅ Configurações globais');
        }

        console.log('\n✅ Migração concluída com sucesso!\n');
        console.log('📊 Verifique os dados no Supabase Dashboard: Table Editor');

        return { success: true };

    } catch (error) {
        console.error('\n❌ Erro durante a migração:', error);
        return { success: false, error };
    }
};

// Função auxiliar para validar conexão antes de migrar
export const validateSupabaseConnection = async () => {
    try {
        const { error } = await supabase.from('settings').select('*').limit(1);
        if (error) {
            console.error('❌ Erro de conexão:', error.message);
            return false;
        }
        console.log('✅ Conexão com Supabase validada!');
        return true;
    } catch (err) {
        console.error('❌ Falha ao conectar com Supabase:', err);
        return false;
    }
};

// Executar migração (descomente a linha abaixo para executar)
// validateSupabaseConnection().then(connected => {
//   if (connected) {
//     migrateDataToSupabase();
//   }
// });
