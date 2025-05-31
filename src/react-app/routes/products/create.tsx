import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { trpc } from '~/lib/trpc';
import { notify } from '~/utils/notifications';
import type { CreateProductInput } from '../../../shared';

export const Route = createFileRoute('/products/create')({
  component: CreateProductPage,
});

function CreateProductPage() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const createProduct = trpc.products.create.useMutation({
    onSuccess: (result) => {
      notify.success(`Product "${result.name}" created successfully`);
      utils.products.invalidate();
      navigate({ to: '/products' });
    },
    onError: (error) => {
      notify.error(error);
    },
  });

  const handleSubmit = (values: CreateProductInput) => {
    createProduct.mutate(values);
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
