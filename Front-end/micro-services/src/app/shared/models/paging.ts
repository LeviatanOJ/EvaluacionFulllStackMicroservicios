export interface PagedResult<T> {
  items: T[];
  total: number;
}

export interface PageQuery {
  page: number; // Número de página
  size: number; // Para cantidad de elementos por página
  sort?: string; // campo de ordenamiento
}
