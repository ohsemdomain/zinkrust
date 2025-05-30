import {
  ProductCategoryNames,
  ProductStatus,
  ProductStatusNames,
} from '../../shared/constants';

export function getCategoryName(category: number): string {
  return (
    ProductCategoryNames[category as keyof typeof ProductCategoryNames] ||
    'Unknown'
  );
}

export function getStatusName(status: number): string {
  return (
    ProductStatusNames[status as keyof typeof ProductStatusNames] || 'Unknown'
  );
}

export function getStatusText(status: number): string {
  return status === ProductStatus.ACTIVE ? 'Active' : 'Inactive';
}
