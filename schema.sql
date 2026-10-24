-- Supabase Schema para Serprove Vet
-- Este script crea las tablas, configura la seguridad de nivel de fila (RLS) y puebla datos iniciales.

-- 1. CREACIÓN DE TABLAS

-- Tabla de Categorías
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabla de Productos
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT REFERENCES public.categories(name) ON DELETE SET NULL,
    laboratorio TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    featured TEXT DEFAULT 'none',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración (Settings)
CREATE TABLE public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Usamos ID fijo porque es una sola fila
    global_primaryColor TEXT,
    global_whatsappPhone TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    contact_schedule TEXT,
    social_instagram TEXT,
    social_facebook TEXT,
    social_twitter TEXT,
    inicio_title TEXT,
    inicio_subtitle TEXT,
    inicio_image TEXT,
    banner_title TEXT,
    banner_subtitle TEXT,
    banner_image TEXT,
    banner_active BOOLEAN,
    nosotros_title TEXT,
    nosotros_text TEXT,
    catalogo_title TEXT,
    catalogo_subtitle TEXT,
    capacitaciones_title TEXT,
    capacitaciones_text TEXT,
    coverage_provinces TEXT,
    show_prices BOOLEAN,
    show_stock BOOLEAN,
    show_cart BOOLEAN,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- Esto previene inyecciones SQL y accesos no autorizados.

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD (POLICIES)
-- Por defecto todos pueden ver (SELECT), pero solo usuarios autenticados pueden modificar.

-- Categorías
CREATE POLICY "Lectura pública de categorías" ON public.categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Escritura autenticada en categorías" ON public.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Productos
CREATE POLICY "Lectura pública de productos" ON public.products
    FOR SELECT TO public USING (true);

CREATE POLICY "Escritura autenticada en productos" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings
CREATE POLICY "Lectura pública de settings" ON public.settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Escritura autenticada en settings" ON public.settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4. POBLAR DATOS INICIALES (MIGRACIÓN DESDE db.json)

INSERT INTO public.categories (name) VALUES
    ('Farmacológicos'),
    ('Nutrición'),
    ('Higiene y Cosmética'),
    ('Accesorios Clínicos'),
    ('Equipamiento');

-- Los productos usarán los nombres de categoría para la relación
INSERT INTO public.products (name, description, category, laboratorio, price, stock, featured, image) VALUES
    ('Cidar Anti-Pulgas', '60 días de protección en una sola toma para perros de todas las razas. Antiparasitario interno de última generación.', 'Farmacológicos', 'VetMax', 8500, 3, 'none', '/product.jpg'),
    ('Flura Max', 'Protección de 90 días en un solo comprimido, acción rápida. Ideal para perros activos.', 'Farmacológicos', 'BioVet', 12800, 25, 'nuevo', '/product.jpg'),
    ('Suplemento Articular Plus', 'Ideal para el desarrollo y fortalecimiento articular en razas grandes. Con glucosamina y condroitina.', 'Nutrición', 'VetNatura', 15600, 0, 'popular', '/product.jpg'),
    ('Shampoo Hipoalergénico Derma', 'Cuidado dermatológico especializado para pieles sensibles. Fórmula suave sin parfum.', 'Higiene y Cosmética', 'DermaPet', 6200, 15, 'none', '/product.jpg'),
    ('NexGard Antiparasitario', 'Tableta masticable para perros. Efectiva contra pulgas y garrapatas por 30 días.', 'Farmacológicos', 'Boehringer', 18500, 8, 'none', '/product.jpg'),
    ('Bravecto Trimestral', 'Protección trimestral. Mata pulgas y garrapatas con una sola dosis.', 'Farmacológicos', 'Merck', 22900, 12, 'nuevo', '/product.jpg'),
    ('Probiodigest Pro', 'Suplemento probiótico para perros y gatos. Mejora la salud intestinal y digestión.', 'Nutrición', 'BioGen', 7800, 20, 'none', '/product.jpg'),
    ('Osteofort Equino', 'Suplemento alimenticio para caballos atletas. Mejora el rendimiento y recuperación muscular.', 'Nutrición', 'Equisalud', 12500, 15, 'none', '/product.jpg'),
    ('Dermobiotex Shampoo', 'Shampoo antimicrobiano para perros y gatos. Trata infecciones cutáneas leves.', 'Higiene y Cosmética', 'VetPharma', 6800, 22, 'oferta', '/product.jpg'),
    ('Exspot Ectoparasiticida', 'Spot-on para perros y gatos. Eficaz contra pulgas, garrapatas y ácaros.', 'Farmacológicos', 'VetCenter', 9500, 30, 'oferta', '/product.jpg'),
    ('Seringa Desechable 5ml', 'Jeringa estéril descartable para aplicación de medicamentos. Paquete x 100 unidades.', 'Accesorios Clínicos', 'Terumo', 2500, 150, 'none', '/product.jpg'),
    ('Termómetro Digital Vet', 'Termómetro de rápido lecturas para animales. Precisión clínica en 10 segundos.', 'Accesorios Clínicos', 'Omron', 8500, 18, 'none', '/product.jpg'),
    ('Bisturí Quirúrgico #22', 'Hoja de bisturí estéril desechable. Acero quirúrgico de alta calidad. Paquete x 10.', 'Accesorios Clínicos', 'Swann-Morton', 3200, 80, 'oferta', '/product.jpg'),
    ('Collar Isabelino Vet', 'Collar de protección post-operatoria. Ajustable para perros y gatos medianos.', 'Accesorios Clínicos', 'VetSoft', 1800, 45, 'none', '/product.jpg'),
    ('Guantes Latex Quirúrgicos', 'Guantes de látex estériles para procedimientos. Talle M. Caja x 100.', 'Accesorios Clínicos', 'Ansell', 4500, 60, 'none', '/product.jpg'),
    ('Mesa Examinación Ajustable', 'Mesa de examinación profesional con altura regulable. Acero inoxidable.', 'Equipamiento', 'VetEquip', 185000, 2, 'popular', '/product.jpg'),
    ('Otoscopio Veterinario', 'Instrumento para exploración de oído. LED de alta intensidad con bombillo de repuesto.', 'Equipamiento', 'Heine', 42000, 5, 'none', '/product.jpg'),
    ('Báscula Digital Pet', 'Báscula para perros y gatos pequeños. Capacidad 20kg, precisión 1g.', 'Equipamiento', 'Tanita', 12500, 12, 'none', '/product.jpg'),
    ('Kit Nebulizador Vet', 'Sistema de nebulización para tratamientos respiratorios. Incluye máscara sizes S-M-L.', 'Equipamiento', 'MediVent', 65000, 3, 'nuevo', '/product.jpg'),
    ('Cepillo Deslanador Pro', 'Cepillo profesional para deshacer nudos y pelaje muerto. Ergonómico.', 'Higiene y Cosmética', 'GroomPro', 4500, 35, 'none', '/product.jpg'),
    ('Shampoo Medicado Sebolytic', 'Tratamiento para dermatitis seborreica. Vehiculiza principios activos al folículo.', 'Higiene y Cosmética', 'Virbac', 8900, 14, 'none', '/product.jpg'),
    ('Collar Antiparasitario Seresto', 'Collar de larga duración (8 meses). Protege contra pulgas y garrapatas.', 'Farmacológicos', 'Bayer', 28000, 10, 'popular', '/product.jpg'),
    ('Vitaminas Complejo B Inyectable', 'Suplemento vitamínico B complejo. Para estados de debilidad y recuperación.', 'Nutrición', 'Konig', 5500, 40, 'none', '/product.jpg'),
    ('Electrolitos Equinos', 'Repositor de electrolitos para caballos. Previene deshidratación en esfuerzo.', 'Nutrición', 'EquiAir', 7200, 25, 'none', '/product.jpg');

INSERT INTO public.settings (
    id, global_primaryColor, global_whatsappPhone, contact_email, contact_phone, 
    contact_address, contact_schedule, social_instagram, social_facebook, 
    social_twitter, inicio_title, inicio_subtitle, inicio_image, 
    banner_title, banner_subtitle, banner_image, banner_active, 
    nosotros_title, nosotros_text, catalogo_title, catalogo_subtitle, 
    capacitaciones_title, capacitaciones_text, coverage_provinces, 
    show_prices, show_stock, show_cart
) VALUES (
    1, '#E91E63', '3777238159', 'contacto@serprove.com', '3777238159',
    'Corrientes, Argentina', 'Lunes a Viernes: 8:00 - 18:00 | Sábados: 8:00 - 12:00',
    'https://instagram.com/serprove', 'https://facebook.com/serprove', '',
    'Soluciones integrales para veterinarias y petshops',
    'Juntos, cuidando y construyendo el bienestar animal con atención personalizada y los mejores laboratorios del mercado.',
    '/hero.jpg', '¡Ofertas Especiales!', 'Hasta 30% de descuento en productos seleccionados',
    '/hero.jpg', true, 'Construyendo el Bienestar Animal',
    'Brindamos asesoramiento, capacitación continua (jornadas teóricas) y los mejores productos de la industria para que tu clínica veterinaria o petshop ofrezca un servicio de excelencia.',
    'Nuestro Catálogo', 'Explora nuestras líneas de productos y laboratorios destacados.',
    'Capacitación Continua', 'Organizamos jornadas teóricas y abordajes prácticos para mantener a tu equipo actualizado con las últimas novedades en medicina veterinaria.',
    'Chaco, Corrientes, Misiones, Formosa,santa fe',
    true, true, true
);

-- 5. MÓDULO POS (PUNTO DE VENTA DE ESCRITORIO OFFLINE-FIRST)

-- Agregar columna de código de barras a productos si no existe
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Tabla de Ventas (Sincronizadas desde el POS)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY,
    sale_number TEXT NOT NULL,
    total NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    payment_method TEXT NOT NULL,
    amount_paid NUMERIC,
    change_amount NUMERIC,
    customer_name TEXT DEFAULT 'Consumidor Final',
    customer_cuit TEXT,
    invoice_type TEXT DEFAULT 'X', -- 'X' (Remito), 'B' (Factura B), 'A' (Factura A)
    cae TEXT,
    cae_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Detalle de Ventas (Items)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- Tabla de Turnos / Arqueos de Caja
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    opening_amount NUMERIC NOT NULL DEFAULT 0,
    closing_amount NUMERIC,
    expected_amount NUMERIC,
    difference NUMERIC,
    status TEXT DEFAULT 'open',
    notes TEXT
);

-- RLS para las tablas de POS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de ventas" ON public.sales FOR SELECT TO public USING (true);
CREATE POLICY "Escritura de ventas" ON public.sales FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Lectura pública de items de venta" ON public.sale_items FOR SELECT TO public USING (true);
CREATE POLICY "Escritura de items de venta" ON public.sale_items FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Lectura pública de turnos" ON public.cash_shifts FOR SELECT TO public USING (true);
CREATE POLICY "Escritura de turnos" ON public.cash_shifts FOR ALL TO public USING (true) WITH CHECK (true);

