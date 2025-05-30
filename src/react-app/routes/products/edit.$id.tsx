import { Container, Loader, Stack } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ProductForm } from '~/components/ProductForm';
import { useNotifications } from '~/contexts/NotificationContext';
import { trpc } from '~/lib/trpc';
import { ProductStatus } from '../../../shared/constants';

export const Route = createFileRoute('/products/edit/$id')({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    category: 1,
    price: 0,
    description: '',
    status: ProductStatus.ACTIVE,
  });

  const {
    data: product,
    isLoading: loadingProduct,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: (result) => {
      showNotification(
        'success',
        `Product "${result.name}" updated successfully`,
      );
      navigate({ to: '/products/$id', params: { id: result.id.toString() } });
    },
    onError: (err) => {
      console.error('Update error:', err);
      showNotification('error', err.message || 'Failed to update product');
    },
  });

  // Pre-populate form when product data loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description || '',
        status: product.status,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || !product) {
      return;
    }

    const payload = {
      id: product.id,
      name: formData.name,
      category: formData.category,
      price: formData.price,
      description: formData.description || undefined,
      status: formData.status,
    };

    updateMutation.mutate(payload);
  };

  if (loadingProduct) {
    return (
      <Container>
        <Stack align="center" py="xl">
          <Loader size="lg" />
        </Stack>
      </Container>
    );
  }

  if (queryError && !product) {
    return (
      <div className="p-2">
        <h2>Edit Product</h2>
        <p style={{ color: 'red' }}>
          Error:{' '}
          {queryError instanceof Error
            ? queryError.message
            : 'Failed to load product'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2>Edit Product</h2>
      <ProductForm
        formData={formData}
        isSubmitting={updateMutation.isPending}
        error={
          updateMutation.error instanceof Error
            ? updateMutation.error.message
            : null
        }
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={() =>
          navigate({
            to: '/products/$id',
            params: { id: product?.id.toString() || '' },
          })
        }
        submitLabel="Update Product"
      />
    </div>
  );
}
