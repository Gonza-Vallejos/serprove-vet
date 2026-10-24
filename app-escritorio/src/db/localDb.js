import Dexie from 'dexie';

// Definición de la Base de Datos Local Offline (IndexedDB de alta velocidad)
export const db = new Dexie('SerproveVetPOS_Local');

db.version(2).stores({
  products: 'id, barcode, name, category, price, stock, laboratorio, synced_at',
  sales: 'id, sale_number, sync_status, created_at, shift_id, payment_method, total',
  sale_items: 'id, sale_id, product_id, product_name',
  cash_shifts: 'id, status, opened_at, closed_at',
  settings: 'key'
});

export const ALL_INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Cidar Anti-Pulgas',
    barcode: '779000000001',
    category: 'Farmacológicos',
    laboratorio: 'VetMax',
    price: 8500,
    stock: 3,
    image: '/product.jpg'
  },
  {
    id: '2',
    name: 'Flura Max',
    barcode: '779000000002',
    category: 'Farmacológicos',
    laboratorio: 'BioVet',
    price: 12800,
    stock: 25,
    image: '/product.jpg'
  },
  {
    id: '3',
    name: 'Suplemento Articular Plus',
    barcode: '779000000003',
    category: 'Nutrición',
    laboratorio: 'VetNatura',
    price: 15600,
    stock: 5,
    image: '/product.jpg'
  },
  {
    id: '4',
    name: 'Shampoo Hipoalergénico Derma',
    barcode: '779000000004',
    category: 'Higiene y Cosmética',
    laboratorio: 'DermaPet',
    price: 6200,
    stock: 15,
    image: '/product.jpg'
  },
  {
    id: '5',
    name: 'NexGard Antiparasitario',
    barcode: '779000000005',
    category: 'Farmacológicos',
    laboratorio: 'Boehringer',
    price: 18500,
    stock: 8,
    image: '/product.jpg'
  },
  {
    id: '6',
    name: 'Bravecto Trimestral',
    barcode: '779000000006',
    category: 'Farmacológicos',
    laboratorio: 'Merck',
    price: 22900,
    stock: 12,
    image: '/product.jpg'
  },
  {
    id: '7',
    name: 'Probiodigest Pro',
    barcode: '779000000007',
    category: 'Nutrición',
    laboratorio: 'BioGen',
    price: 7800,
    stock: 20,
    image: '/product.jpg'
  },
  {
    id: '8',
    name: 'Osteofort Equino',
    barcode: '779000000008',
    category: 'Nutrición',
    laboratorio: 'Equisalud',
    price: 12500,
    stock: 15,
    image: '/product.jpg'
  },
  {
    id: '9',
    name: 'Dermobiotex Shampoo',
    barcode: '779000000009',
    category: 'Higiene y Cosmética',
    laboratorio: 'VetPharma',
    price: 6800,
    stock: 22,
    image: '/product.jpg'
  },
  {
    id: '10',
    name: 'Exspot Ectoparasiticida',
    barcode: '779000000010',
    category: 'Farmacológicos',
    laboratorio: 'VetCenter',
    price: 9500,
    stock: 30,
    image: '/product.jpg'
  },
  {
    id: '11',
    name: 'Seringa Desechable 5ml',
    barcode: '779000000011',
    category: 'Accesorios Clínicos',
    laboratorio: 'Terumo',
    price: 2500,
    stock: 150,
    image: '/product.jpg'
  },
  {
    id: '12',
    name: 'Termómetro Digital Vet',
    barcode: '779000000012',
    category: 'Accesorios Clínicos',
    laboratorio: 'Omron',
    price: 8500,
    stock: 18,
    image: '/product.jpg'
  },
  {
    id: '13',
    name: 'Bisturí Quirúrgico #22',
    barcode: '779000000013',
    category: 'Accesorios Clínicos',
    laboratorio: 'Swann-Morton',
    price: 3200,
    stock: 80,
    image: '/product.jpg'
  },
  {
    id: '14',
    name: 'Collar Isabelino Vet',
    barcode: '779000000014',
    category: 'Accesorios Clínicos',
    laboratorio: 'VetSoft',
    price: 1800,
    stock: 45,
    image: '/product.jpg'
  },
  {
    id: '15',
    name: 'Guantes Latex Quirúrgicos',
    barcode: '779000000015',
    category: 'Accesorios Clínicos',
    laboratorio: 'Ansell',
    price: 4500,
    stock: 60,
    image: '/product.jpg'
  },
  {
    id: '16',
    name: 'Mesa Examinación Ajustable',
    barcode: '779000000016',
    category: 'Equipamiento',
    laboratorio: 'VetEquip',
    price: 185000,
    stock: 2,
    image: '/product.jpg'
  },
  {
    id: '17',
    name: 'Otoscopio Veterinario',
    barcode: '779000000017',
    category: 'Equipamiento',
    laboratorio: 'Heine',
    price: 42000,
    stock: 5,
    image: '/product.jpg'
  },
  {
    id: '18',
    name: 'Báscula Digital Pet',
    barcode: '779000000018',
    category: 'Equipamiento',
    laboratorio: 'Tanita',
    price: 12500,
    stock: 12,
    image: '/product.jpg'
  },
  {
    id: '19',
    name: 'Kit Nebulizador Vet',
    barcode: '779000000019',
    category: 'Equipamiento',
    laboratorio: 'MediVent',
    price: 65000,
    stock: 3,
    image: '/product.jpg'
  },
  {
    id: '20',
    name: 'Cepillo Deslanador Pro',
    barcode: '779000000020',
    category: 'Higiene y Cosmética',
    laboratorio: 'GroomPro',
    price: 4500,
    stock: 35,
    image: '/product.jpg'
  },
  {
    id: '21',
    name: 'Shampoo Medicado Sebolytic',
    barcode: '779000000021',
    category: 'Higiene y Cosmética',
    laboratorio: 'Virbac',
    price: 8900,
    stock: 14,
    image: '/product.jpg'
  },
  {
    id: '22',
    name: 'Collar Antiparasitario Seresto',
    barcode: '779000000022',
    category: 'Farmacológicos',
    laboratorio: 'Bayer',
    price: 28000,
    stock: 10,
    image: '/product.jpg'
  },
  {
    id: '23',
    name: 'Vitaminas Complejo B Inyectable',
    barcode: '779000000023',
    category: 'Nutrición',
    laboratorio: 'Konig',
    price: 5500,
    stock: 40,
    image: '/product.jpg'
  },
  {
    id: '24',
    name: 'Electrolitos Equinos',
    barcode: '779000000024',
    category: 'Nutrición',
    laboratorio: 'EquiAir',
    price: 7200,
    stock: 25,
    image: '/product.jpg'
  }
];

// Carga inicial local asegurando los 24 productos limpios y sin duplicados
export async function seedInitialLocalProductsIfEmpty() {
  try {
    // 1. Eliminar cualquier producto residual antiguo que tenga prefijo 'p-' (como p-10, p-11, p-12)
    const legacyProducts = await db.products.filter(p => String(p.id).startsWith('p-')).toArray();
    if (legacyProducts.length > 0) {
      console.log(`[Offline DB] Purgando ${legacyProducts.length} productos duplicados antiguos (prefijo 'p-')...`);
      await db.products.bulkDelete(legacyProducts.map(p => p.id));
    }
  } catch (err) {
    console.error('Error limpiando productos antiguos:', err);
  }

  const count = await db.products.count();
  if (count === 0) {
    console.log('[Offline DB] Poblando catálogo oficial limpio con 24 productos...');
    await db.products.bulkPut(ALL_INITIAL_PRODUCTS);
  }
}
