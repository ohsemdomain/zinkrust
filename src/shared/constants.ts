export const ProductCategory = {
  PACKAGING: 1,
  LABEL: 2,
  OTHER: 3,
} as const;

export const ProductStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

export type ProductCategoryType =
  (typeof ProductCategory)[keyof typeof ProductCategory];
export type ProductStatusType =
  (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductCategoryNames: Record<ProductCategoryType, string> = {
  [ProductCategory.PACKAGING]: 'Packaging',
  [ProductCategory.LABEL]: 'Label',
  [ProductCategory.OTHER]: 'Other',
};

export const ProductStatusNames: Record<ProductStatusType, string> = {
  [ProductStatus.INACTIVE]: 'Inactive',
  [ProductStatus.ACTIVE]: 'Active',
};
