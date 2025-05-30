import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { useNotifications } from '~/contexts/NotificationContext';
import { useProductMutations } from '~/hooks/useProductMutations';
import type { CreateProduct } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/create')({
  component: CreateProductPage,
});

function CreateProductPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const { createProduct } = useProductMutations();

  const createMutation = {
    ...createProduct,
    mutate: (data: CreateProduct) => {
      createProduct.mutate(data, {
        onSuccess: (result) => {
          showNotification(
            'success',
            `Product "${result.name}" created successfully`,
          );
          navigate({ to: '/products' });
        },
        onError: (err) => {
          console.error('Create error:', err);
          showNotification('error', err.message || 'Failed to create product');
        },
      });
    },
    isPending: createProduct.isPending,
    error: createProduct.error,
  };

  const handleSubmit = (values: CreateProduct) => {
    createMutation.mutate(values);
  };

  return (
    <div className="p-2">
      <h2>Create New Product</h2>
      <ProductForm
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error instanceof Error
            ? createMutation.error.message
            : null
        }
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: '/products' })}
        submitLabel="Create Product"
      />
    </div>
  );
}
