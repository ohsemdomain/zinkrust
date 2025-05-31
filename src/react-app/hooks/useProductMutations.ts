import { trpc } from '~/lib/trpc';

export function useProductMutations() {
  const utils = trpc.useUtils();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.getAll.invalidate();
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.invalidate();
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.invalidate();
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
}