const fs = require('fs');

const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));

let sql = `-- Seed data for Serprove Vet\n\n`;

// Categories
sql += `-- Categories\n`;
data.categories.forEach(c => {
    sql += `INSERT INTO public.categories (id, name) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}');\n`;
});

// Products
sql += `\n-- Products\n`;
data.products.forEach(p => {
    sql += `INSERT INTO public.products (id, name, description, category, laboratorio, price, stock, featured, image) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', '${p.category.replace(/'/g, "''")}', '${p.laboratorio.replace(/'/g, "''")}', ${p.price}, ${p.stock}, '${p.featured}', '${p.image.replace(/'/g, "''")}');\n`;
});

// Settings (single row)
sql += `\n-- Settings\n`;
const s = data.settings;
sql += `INSERT INTO public.settings (
    id, global_primaryColor, global_whatsappPhone, contact_email, contact_phone, 
    contact_address, contact_schedule, social_instagram, social_facebook, 
    social_twitter, inicio_title, inicio_subtitle, inicio_image, 
    banner_title, banner_subtitle, banner_image, banner_active, 
    nosotros_title, nosotros_text, catalogo_title, catalogo_subtitle, 
    capacitaciones_title, capacitaciones_text, coverage_provinces, 
    show_prices, show_stock, show_cart
) VALUES (
    1, '${s.global_primaryColor}', '${s.global_whatsappPhone}', '${s.contact_email}', '${s.contact_phone}',
    '${s.contact_address}', '${s.contact_schedule}', '${s.social_instagram}', '${s.social_facebook}',
    '${s.social_twitter}', '${s.inicio_title}', '${s.inicio_subtitle}', '${s.inicio_image}',
    '${s.banner_title}', '${s.banner_subtitle}', '${s.banner_image}', ${s.banner_active},
    '${s.nosotros_title}', '${s.nosotros_text}', '${s.catalogo_title}', '${s.catalogo_subtitle}',
    '${s.capacitaciones_title}', '${s.capacitaciones_text}', '${s.coverage_provinces}',
    ${s.show_prices}, ${s.show_stock}, ${s.show_cart}
);\n`;

fs.writeFileSync('seed.sql', sql);
console.log('Seed SQL generated.');
