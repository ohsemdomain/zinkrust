import { trpc } from '~/lib/trpc';
import { PriceUtils } from '../../shared/utils/price';
import type {
  CreateProduct,
  Product,
  UpdateProduct,
} from '../../worker/schemas/products';

type CacheData = {
  products: Product[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  perPage: number;
};

type CacheKey = {
  filter_by: 'active' | 'inactive' | 'all';
  page: number;
  per_page: number;
  sort_column: 'name' | 'category' | 'status' | 'created_at' | 'updated_at';
  sort_order: 'ASC' | 'DESC';
};

type CacheEntry = { data: CacheData; key: CacheKey };

export function useProductMutations() {
  const utils = trpc.useUtils();

  const createProduct = trpc.products.create.useMutation({
    onMutate: async (newProduct) => {
      await utils.products.getAll.cancel();

      const tempId = Math.floor(Math.random() * 100000000);
      const optimisticProduct: Product = {
        id: tempId,
        name: newProduct.name,
        category: newProduct.category,
        price_cents: Math.round(newProduct.price_cents * 100), // Direct conversion since form sends dollars
        description: newProduct.description || null,
        status: 1, // Always create as active
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };

      const previousCaches: Record<string, CacheEntry> = {};

      // Update caches for all relevant filter combinations
      const filters: ('all' | 'active' | 'inactive')[] = [
        'all',
        'active',
        'inactive',
      ];
      const sortOrders: {
        sort_column: CacheKey['sort_column'];
        sort_order: CacheKey['sort_order'];
      }[] = [
        { sort_column: 'created_at', sort_order: 'DESC' },
        { sort_column: 'name', sort_order: 'ASC' },
      ];

      for (const filter_by of filters) {
        for (const sortConfig of sortOrders) {
          // Check multiple pages
          for (let page = 0; page < 3; page++) {
            const cacheKey: CacheKey = {
              filter_by,
              page,
              per_page: 25,
              sort_column: sortConfig.sort_column,
              sort_order: sortConfig.sort_order,
            };
            const currentData = utils.products.getAll.getData(cacheKey);

            if (currentData) {
              const cacheKeyStr = `${filter_by}-${sortConfig.sort_column}-${sortConfig.sort_order}-${page}`;
              previousCaches[cacheKeyStr] = {
                data: currentData,
                key: cacheKey,
              };

              // Only update first page with new product if sorting by created_at DESC (newest first)
              // Since all new products are active, only update 'all' and 'active' filters
              if (
                page === 0 &&
                sortConfig.sort_column === 'created_at' &&
                sortConfig.sort_order === 'DESC'
              ) {
                const shouldAdd = filter_by === 'all' || filter_by === 'active';

                if (shouldAdd) {
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: [optimisticProduct, ...currentData.products],
                    total: currentData.total + 1,
                  });
                }
              }
            }
          }
        }
      }

      return { previousCaches };
    },
    onError: (_err, _newProduct, context) => {
      if (context?.previousCaches) {
        // Restore all cached queries
        for (const cache of Object.values(context.previousCaches)) {
          const { data, key } = cache;
          utils.products.getAll.setData(key, data);
        }
      }
    },
    onSuccess: (data) => {
      utils.products.getById.setData({ id: data.id }, data);
    },
    onSettled: () => {
      utils.products.getAll.invalidate();
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onMutate: async (updatedProduct) => {
      await utils.products.getAll.cancel();
      await utils.products.getById.cancel({ id: updatedProduct.id });

      const previousProduct = utils.products.getById.getData({
        id: updatedProduct.id,
      });

      const previousCaches: Record<string, CacheEntry> = {};
      const updatedProductData = previousProduct
        ? {
            ...previousProduct,
            ...updatedProduct,
            price_cents: Math.round(updatedProduct.price_cents * 100), // Direct conversion since form sends dollars
            updated_at: Math.floor(Date.now() / 1000),
          }
        : null;

      // Update caches for all relevant filter combinations
      const filters: ('all' | 'active' | 'inactive')[] = [
        'all',
        'active',
        'inactive',
      ];
      const sortOrders: {
        sort_column: CacheKey['sort_column'];
        sort_order: CacheKey['sort_order'];
      }[] = [
        { sort_column: 'created_at', sort_order: 'DESC' },
        { sort_column: 'name', sort_order: 'ASC' },
      ];

      for (const filter_by of filters) {
        for (const sortConfig of sortOrders) {
          // Check multiple pages
          for (let page = 0; page < 3; page++) {
            const cacheKey: CacheKey = {
              filter_by,
              page,
              per_page: 25,
              sort_column: sortConfig.sort_column,
              sort_order: sortConfig.sort_order,
            };
            const currentData = utils.products.getAll.getData(cacheKey);

            if (currentData) {
              const cacheKeyStr = `${filter_by}-${sortConfig.sort_column}-${sortConfig.sort_order}-${page}`;
              previousCaches[cacheKeyStr] = {
                data: currentData,
                key: cacheKey,
              };

              const productIndex = currentData.products.findIndex(
                (p) => p.id === updatedProduct.id,
              );

              if (productIndex !== -1) {
                // Product exists in this cache
                const shouldRemove =
                  (filter_by === 'active' && updatedProduct.status === 0) ||
                  (filter_by === 'inactive' && updatedProduct.status === 1);

                if (shouldRemove) {
                  // Remove from this cache
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: currentData.products.filter(
                      (p) => p.id !== updatedProduct.id,
                    ),
                    total: currentData.total - 1,
                  });
                } else if (updatedProductData) {
                  // Update in this cache
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: currentData.products.map((product) =>
                      product.id === updatedProduct.id
                        ? updatedProductData
                        : product,
                    ),
                  });
                }
              } else if (
                page === 0 &&
                sortConfig.sort_column === 'created_at' &&
                sortConfig.sort_order === 'DESC'
              ) {
                // Product doesn't exist in this cache, check if it should be added (only on first page of newest first)
                const shouldAdd =
                  filter_by === 'all' ||
                  (filter_by === 'active' && updatedProduct.status === 1) ||
                  (filter_by === 'inactive' && updatedProduct.status === 0);

                if (shouldAdd && updatedProductData) {
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: [updatedProductData, ...currentData.products],
                    total: currentData.total + 1,
                  });
                }
              }
            }
          }
        }
      }

      if (previousProduct && updatedProductData) {
        utils.products.getById.setData(
          { id: updatedProduct.id },
          updatedProductData,
        );
      }

      return { previousCaches, previousProduct };
    },
    onError: (_err, updatedProduct, context) => {
      if (context?.previousCaches) {
        // Restore all cached queries
        for (const cache of Object.values(context.previousCaches)) {
          const { data, key } = cache;
          utils.products.getAll.setData(key, data);
        }
      }
      if (context?.previousProduct) {
        utils.products.getById.setData(
          { id: updatedProduct.id },
          context.previousProduct,
        );
      }
    },
    onSuccess: (data) => {
      if (data) {
        utils.products.getById.setData({ id: data.id }, data);
      }
    },
    onSettled: (_data, _error, variables) => {
      utils.products.getAll.invalidate();
      utils.products.getById.invalidate({ id: variables.id });
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onMutate: async (variables) => {
      await utils.products.getAll.cancel();
      await utils.products.getById.cancel({ id: variables.id });

      const previousProduct = utils.products.getById.getData({
        id: variables.id,
      });

      const previousCaches: Record<string, CacheEntry> = {};

      // Note: This is now a soft delete (status = 0) on the backend
      // Update caches for all relevant filter combinations
      const filters: ('all' | 'active' | 'inactive')[] = [
        'all',
        'active',
        'inactive',
      ];
      const sortOrders: {
        sort_column: CacheKey['sort_column'];
        sort_order: CacheKey['sort_order'];
      }[] = [
        { sort_column: 'created_at', sort_order: 'DESC' },
        { sort_column: 'name', sort_order: 'ASC' },
      ];

      for (const filter_by of filters) {
        for (const sortConfig of sortOrders) {
          // Check multiple pages
          for (let page = 0; page < 3; page++) {
            const cacheKey: CacheKey = {
              filter_by,
              page,
              per_page: 25,
              sort_column: sortConfig.sort_column,
              sort_order: sortConfig.sort_order,
            };
            const currentData = utils.products.getAll.getData(cacheKey);

            if (currentData) {
              const cacheKeyStr = `${filter_by}-${sortConfig.sort_column}-${sortConfig.sort_order}-${page}`;
              previousCaches[cacheKeyStr] = {
                data: currentData,
                key: cacheKey,
              };

              const productIndex = currentData.products.findIndex(
                (p) => p.id === variables.id,
              );

              if (productIndex !== -1) {
                if (filter_by === 'active') {
                  // Remove from active view
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: currentData.products.filter(
                      (p) => p.id !== variables.id,
                    ),
                    total: currentData.total - 1,
                  });
                } else if (filter_by === 'inactive') {
                  // Should not be in inactive view yet
                } else if (filter_by === 'all') {
                  // Update status in all view
                  utils.products.getAll.setData(cacheKey, {
                    ...currentData,
                    products: currentData.products.map((p) =>
                      p.id === variables.id ? { ...p, status: 0 } : p,
                    ),
                  });
                }
              } else if (
                filter_by === 'inactive' &&
                page === 0 &&
                previousProduct &&
                sortConfig.sort_column === 'created_at' &&
                sortConfig.sort_order === 'DESC'
              ) {
                // Add to inactive view (first page only, newest first)
                utils.products.getAll.setData(cacheKey, {
                  ...currentData,
                  products: [
                    { ...previousProduct, status: 0 },
                    ...currentData.products,
                  ],
                  total: currentData.total + 1,
                });
              }
            }
          }
        }
      }

      utils.products.getById.setData({ id: variables.id }, undefined);

      return { previousCaches, previousProduct };
    },
    onError: (_err, variables, context) => {
      if (context?.previousCaches) {
        // Restore all cached queries
        for (const cache of Object.values(context.previousCaches)) {
          const { data, key } = cache;
          utils.products.getAll.setData(key, data);
        }
      }
      if (context?.previousProduct) {
        utils.products.getById.setData(
          { id: variables.id },
          context.previousProduct,
        );
      }
    },
    onSettled: () => {
      utils.products.getAll.invalidate();
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
