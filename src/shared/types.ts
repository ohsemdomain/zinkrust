// ==================== CORE INTERFACES ====================
export interface Product {
  id: number;
  name: string;
  category: number;
  price_cents: number;
  description: string | null;
  status: number;
  created_at: number;
  updated_at: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  perPage: number;
}