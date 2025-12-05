export interface ProductImage {
    image_url: string;
}

export interface ProductColor {
    color_name: string;
    color_hex: string;
}

export interface ProductStock {
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    stock: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    gender: 'mujer' | 'hombre' | 'niños';
    category: 'poleras' | 'pantalones' | 'vestidos' | 'chaquetas' | 'zapatos';
    style: 'casual' | 'formal' | 'deportivo';
    material?: string;
    care_instructions?: string;
    is_new: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    total_stock: number;
    images: string[]; // Lista de URLs de imágenes 
    colors: ProductColor[];
    stock_by_size: ProductStock[];
}

export interface ProductsResponse {
    success: true;
    count: number;
    products: Product[];
}