import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { useNotification } from '~/hooks/useNotification';
import { useProductMutations } from '~/hooks/useProductMutations';
import type { CreateProductInput } from '../../../shared/types';

export const Route = createFileRoute('/products/create')({
  component: CreateProductPage,
});

function CreateProductPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createProduct } = useProductMutations();

  const handleSubmit = (values: CreateProductInput) => {
    createProduct.mutate(values, {
      onSuccess: (result) => {
        showSuccess(`Product "${result.name}" created successfully`);
        navigate({ to: '/products' });
      },
      onError: (error) => {
        showError(error);
      },
    });
  };

  return (
    <div className="p-2">
      <h2>Create New Product</h2>
      <ProductForm
        isSubmitting={createProduct.isPending}
        error={createProduct.error?.message || null}
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: '/products' })}
        submitLabel="Create Product"
      />
    </div>
  );
}
