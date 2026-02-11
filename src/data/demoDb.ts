import { Product, Order, OrderItem } from '../types';
import { mockProducts } from './mockCatalog';

const PRODUCTS_KEY = 'delikreol_demo_products';
const ORDERS_KEY = 'delikreol_demo_orders';
const PARTNERS_KEY = 'delikreol_demo_partners';

export function seedDemoData() {
  const existing = localStorage.getItem(PRODUCTS_KEY);
  if (existing) return;

  // create 3 demo vendors
  const vendors = [
    { id: 'v1', name: 'Chez Tatie' },
    { id: 'v2', name: 'La Case Créole' },
    { id: 'v3', name: 'Distillerie du Nord' },
  ];

  // map mockProducts to Product shape
  const products: Product[] = mockProducts.slice(0, 10).map((p, idx) => ({
    id: 'p_' + (idx + 1),
    vendor_id: vendors[idx % vendors.length].id,
    name: p.name,
    description: p.description ?? null,
    category: p.category,
    price: p.price,
    image_url: null,
    is_available: true,
    stock_quantity: 20,
    created_at: new Date().toISOString(),
  }));

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  const orders: Order[] = [
    {
      id: 'o1',
      customer_id: 'demo_customer_1',
      order_number: 'DLK-1001',
      status: 'delivered',
      delivery_type: 'home_delivery',
      delivery_address: 'Fort-de-France',
      delivery_fee: 3.5,
      total_amount: 25.5,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      items: [
        {
          id: 'oi1',
          order_id: 'o1',
          product_id: products[0].id,
          vendor_id: products[0].vendor_id,
          quantity: 1,
          unit_price: products[0].price,
          subtotal: products[0].price,
          vendor_commission: products[0].price * 0.1,
        } as OrderItem,
      ],
    },
    {
      id: 'o2',
      customer_id: 'demo_customer_2',
      order_number: 'DLK-1002',
      status: 'pending',
      delivery_type: 'pickup',
      delivery_fee: 0,
      total_amount: 18.0,
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'oi2',
          order_id: 'o2',
          product_id: products[1].id,
          vendor_id: products[1].vendor_id,
          quantity: 2,
          unit_price: products[1].price,
          subtotal: products[1].price * 2,
          vendor_commission: products[1].price * 2 * 0.1,
        } as OrderItem,
      ],
    },
  ];

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  const partners = [
    {
      id: 'pa1',
      company_name: 'Nouvo Konfitir',
      partner_type: 'vendor',
      contact_email: 'contact@konfitir.example',
      phone: '+596600000',
      address: 'Le Marin',
      status: 'submitted',
      docs: [],
    },
  ];

  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
}

export function readDemoProducts(): Product[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Product[];
}

export function writeDemoProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function readDemoOrders(): Order[] {
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Order[];
}

export function writeDemoOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function readDemoPartners(): any[] {
  const raw = localStorage.getItem(PARTNERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as any[];
}

export function writeDemoPartners(items: any[]) {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(items));
}
