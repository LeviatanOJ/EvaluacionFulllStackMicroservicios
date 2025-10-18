export interface Product {
  id: number;
  name: string | null;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  price: number;
  stock: number;
}
