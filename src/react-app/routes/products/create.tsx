import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ProductForm } from '~/components/ProductForm';
import { useNotifications } from '~/contexts/NotificationContext';
import { trpc } from '~/lib/trpc';
import { ProductStatus } from '../../../shared/constants';

export const Route = createFileRoute('/products/create')({
  component: CreateProduct,
});

function CreateProduct() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    category: 1,
    price: 0,
    description: '',
    status: ProductStatus.ACTIVE,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: (result) => {
      const statusText = result.status === ProductStatus.INACTIVE ? ' (inactive)' : '';
      showNotification(
        'success',
        `Product "${result.name}" created successfully${statusText}`,
      );
      navigate({ to: '/products' });
    },
    onError: (err) => {
      console.error('Create error:', err);
      showNotification('error', err.message || 'Failed to create product');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      description: formData.description || undefined,
      status: formData.status,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="p-2">
      <h2>Create New Product</h2>
      <ProductForm
        formData={formData}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.error instanceof Error
            ? createMutation.error.message
            : null
        }
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={() => navigate({ to: '/products' })}
        submitLabel="Create Product"
      />
    </div>
  );
}
