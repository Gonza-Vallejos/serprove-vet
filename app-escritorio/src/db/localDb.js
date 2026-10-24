import Dexie from 'dexie';

// Definición de la Base de Datos Local Offline (IndexedDB de alta velocidad)
export const db = new Dexie('SerproveVetPOS_Local');

db.version(1).stores({
  products: 'id, barcode, name, category, price, stock, laboratorio, synced_at',
  sales: 'id, sale_number, sync_status, created_at, shift_id, payment_method, total',
  sale_items: 'id, sale_id, product_id, product_name',
  cash_shifts: 'id, status, opened_at, closed_at',
  settings: 'key'
});

// Semilla inicial local en caso de primer arranque sin conexión
export async function seedInitialLocalProductsIfEmpty() {
  const count = await db.products.count();
  if (count === 0) {
    console.log('[Offline DB] Inicializando catálogo base en almacenamiento local...');
    await db.products.bulkPut([
      {
        id: 'p-1',
        name: 'Cidar Anti-Pulgas',
        barcode: '7791234567890',
        category: 'Farmacológicos',
        laboratorio: 'VetMax',
        price: 8500,
        stock: 15,
        image: '/product.jpg'
      },
      {
        id: 'p-2',
        name: 'Flura Max 90 Días',
        barcode: '7791234567891',
        category: 'Farmacológicos',
        laboratorio: 'BioVet',
        price: 12800,
        stock: 25,
        image: '/product.jpg'
      },
      {
        id: 'p-3',
        name: 'NexGard Antiparasitario Perro',
        barcode: '7791234567892',
        category: 'Farmacológicos',
        laboratorio: 'Boehringer',
        price: 18500,
        stock: 10,
        image: '/product.jpg'
      },
      {
        id: 'p-4',
        name: 'Bravecto Trimestral',
        barcode: '7791234567893',
        category: 'Farmacológicos',
        laboratorio: 'Merck',
        price: 22900,
        stock: 12,
        image: '/product.jpg'
      },
      {
        id: 'p-5',
        name: 'Collar Seresto 8 Meses',
        barcode: '7791234567894',
        category: 'Farmacológicos',
        laboratorio: 'Bayer',
        price: 28000,
        stock: 8,
        image: '/product.jpg'
      },
      {
        id: 'p-6',
        name: 'Suplemento Articular Plus',
        barcode: '7791234567895',
        category: 'Nutrición',
        laboratorio: 'VetNatura',
        price: 15600,
        stock: 14,
        image: '/product.jpg'
      },
      {
        id: 'p-7',
        name: 'Probiodigest Pro Mascotas',
        barcode: '7791234567896',
        category: 'Nutrición',
        laboratorio: 'BioGen',
        price: 7800,
        stock: 20,
        image: '/product.jpg'
      },
      {
        id: 'p-8',
        name: 'Shampoo Hipoalergénico Derma',
        barcode: '7791234567897',
        category: 'Higiene y Cosmética',
        laboratorio: 'DermaPet',
        price: 6200,
        stock: 18,
        image: '/product.jpg'
      },
      {
        id: 'p-9',
        name: 'Dermobiotex Shampoo Medicado',
        barcode: '7791234567898',
        category: 'Higiene y Cosmética',
        laboratorio: 'VetPharma',
        price: 6800,
        stock: 22,
        image: '/product.jpg'
      },
      {
        id: 'p-10',
        name: 'Jeringa Descartable 5ml (x100)',
        barcode: '7791234567899',
        category: 'Accesorios Clínicos',
        laboratorio: 'Terumo',
        price: 2500,
        stock: 150,
        image: '/product.jpg'
      },
      {
        id: 'p-11',
        name: 'Termómetro Digital Veterinario',
        barcode: '7791234567800',
        category: 'Accesorios Clínicos',
        laboratorio: 'Omron',
        price: 8500,
        stock: 18,
        image: '/product.jpg'
      },
      {
        id: 'p-12',
        name: 'Guantes Quirúrgicos Látex M (x100)',
        barcode: '7791234567801',
        category: 'Accesorios Clínicos',
        laboratorio: 'Ansell',
        price: 4500,
        stock: 60,
        image: '/product.jpg'
      }
    ]);
  }
}
