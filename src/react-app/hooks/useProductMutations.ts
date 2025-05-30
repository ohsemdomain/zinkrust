import { trpc } from '~/lib/trpc';
import type { Product } from '../../worker/schemas/products';

export function useProductMutations() {
  const utils = trpc.useUtils();

  const createProduct = trpc.products.create.useMutation({
    onMutate: async (newProduct) => {
      await utils.products.getAll.cancel();

      const previousProducts = utils.products.getAll.getData();

      const tempId = Math.floor(Math.random() * 100000000);
      const optimisticProduct: Product = {
        id: tempId,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        description: newProduct.description || null,
        status: newProduct.status || 1,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };

      // Only update cache for 'all' or 'active' status filter
      utils.products.getAll.setData(undefined, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          products: [optimisticProduct, ...old.products],
          total: old.total + 1,
        };
      });

      return { previousProducts };
    },
    onError: (_err, _newProduct, context) => {
      if (context?.previousProducts) {
        utils.products.getAll.setData(undefined, context.previousProducts);
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

      const previousProducts = utils.products.getAll.getData();
      const previousProduct = utils.products.getById.getData({
        id: updatedProduct.id,
      });

      utils.products.getAll.setData(undefined, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          products: old.products.map((product) =>
            product.id === updatedProduct.id
              ? {
                  ...product,
                  ...updatedProduct,
                  updated_at: Math.floor(Date.now() / 1000),
                }
              : product,
          ),
        };
      });

      if (previousProduct) {
        utils.products.getById.setData(
          { id: updatedProduct.id },
          {
            ...previousProduct,
            ...updatedProduct,
            updated_at: Math.floor(Date.now() / 1000),
          },
        );
      }

      return { previousProducts, previousProduct };
    },
    onError: (_err, updatedProduct, context) => {
      if (context?.previousProducts) {
        utils.products.getAll.setData(undefined, context.previousProducts);
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

      const previousProducts = utils.products.getAll.getData();
      const previousProduct = utils.products.getById.getData({
        id: variables.id,
      });

      // Note: This is now a soft delete (status = 0) on the backend
      // Remove from active products view
      utils.products.getAll.setData(undefined, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          products: old.products.filter(
            (product) => product.id !== variables.id,
          ),
          total: old.total - 1,
        };
      });

      utils.products.getById.setData({ id: variables.id }, undefined);

      return { previousProducts, previousProduct };
    },
    onError: (_err, variables, context) => {
      if (context?.previousProducts) {
        utils.products.getAll.setData(undefined, context.previousProducts);
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
