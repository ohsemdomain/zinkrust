// ==================== PRODUCT CONSTANTS ====================
export const ProductCategory = {
  PACKAGING: 1,
  LABEL: 2,
  OTHER: 3,
} as const;

export const ProductStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

// ==================== NAME MAPPINGS ====================
export const ProductCategoryNames: Record<number, string> = {
  [ProductCategory.PACKAGING]: 'Packaging',
  [ProductCategory.LABEL]: 'Label',
  [ProductCategory.OTHER]: 'Other',
};

export const ProductStatusNames: Record<number, string> = {
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.INACTIVE]: 'Inactive',
};
