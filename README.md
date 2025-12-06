# 🛍️ FINA Perú - E-commerce Frontend

Frontend moderno y minimalista para una tienda de ropa exclusiva, desarrollado con **Next.js 15+**, **TypeScript** y **Tailwind CSS**. Este proyecto consume una API REST personalizada y ofrece una experiencia de usuario fluida con gestión de estado global y paneles administrativos.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38b2ac)

## ✨ Características Principales

### 🌐 Público (Cliente)
- **Diseño Editorial:** Interfaz limpia inspirada en marcas de lujo (Fina Perú, Revolve).
- **Catálogo Avanzado:** Filtros por categoría, género, precio y estilo.
- **Búsqueda Inteligente:** Barra de búsqueda en tiempo real.
- **Carrito de Compras:** Persistencia local, resumen de costos y validación de stock.
- **Wishlist:** Lista de deseos para guardar productos favoritos.
- **Checkout Seguro:** Simulación realista de pasarela de pagos con validación de tarjetas.
- **Gestión de Cuenta:** Historial de pedidos con estados y detalle de compra.

### 👨‍💼 Panel de Administración (CMS)
- **Dashboard:** Métricas clave (Ventas, Pedidos, Usuarios) y gráficos interactivos (`Recharts`).
- **Gestión de Productos:** CRUD completo con soporte para múltiples imágenes, colores y stock por talla.
- **Gestión de Pedidos:** Visualización de todas las órdenes y cambio de estados.
- **Gestión de Usuarios:** Control de roles (Admin/Cliente) y bloqueo de cuentas.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS, CLSX, Tailwind-merge
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Notificaciones:** Sonner (Toasts)
- **HTTP Client:** Axios (con interceptores para JWT)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ecommerce-frontend.git
cd ecommerce-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en http://localhost:3000.

## 📁 Estructura del Proyecto
```
src/
├── app/                 # Rutas de Next.js (App Router)
│   ├── (auth)/          # Rutas de Login/Registro
│   ├── admin/           # Panel de Administración protegido
│   ├── cart/            # Carrito de compras
│   ├── checkout/        # Pasarela de pago
│   ├── orders/          # Historial de pedidos
│   ├── products/        # Detalle de producto
│   └── profile/         # Perfil de usuario
├── components/          # Componentes reutilizables (Navbar, Cards, Charts...)
├── context/             # Context API (CartContext, WishlistContext)
├── lib/                 # Servicios de API (Axios, Auth, Products...)
└── types/               # Definiciones de TypeScript (Interfaces)
```

## 📸 Configuración de Imágenes
El proyecto permite imágenes externas de dominios configurados en `next.config.ts`:
- images.unsplash.com
- hmperu.vtexassets.com
- hmcolombia.vtexassets.com
- lp2.hm.com
- i.pinimg.com
- rimage.ripley.com.pe

---
