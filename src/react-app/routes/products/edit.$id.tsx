import { Container, Loader, Stack } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { useNotifications } from '~/contexts/NotificationContext';
import { trpc } from '~/lib/trpc';
import { useProductMutations } from '~/hooks/useProductMutations';
import type {
  CreateProduct,
  UpdateProduct,
} from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/edit/$id')({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const {
    data: product,
    isLoading: loadingProduct,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const { updateProduct } = useProductMutations();

  const updateMutation = {
    ...updateProduct,
    mutate: (data: UpdateProduct) => {
      updateProduct.mutate(data, {
        onSuccess: (result) => {
          showNotification(
            'success',
            `Product "${result.name}" updated successfully`,
          );
          navigate({
            to: '/products/$id',
            params: { id: result.id.toString() },
          });
        },
        onError: (err) => {
          console.error('Update error:', err);
          showNotification('error', err.message || 'Failed to update product');
        },
      });
    },
    isPending: updateProduct.isPending,
    error: updateProduct.error,
  };

  const handleSubmit = (values: CreateProduct) => {
    if (!product) return;

    const payload = {
      id: product.id,
      ...values,
      status: product.status, // Keep existing status in edit mode
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
        initialValues={
          product
            ? {
                name: product.name,
                category: product.category,
                price_cents: product.price_cents,
                description: product.description || '',
              }
            : undefined
        }
        isSubmitting={updateMutation.isPending}
        error={
          updateMutation.error instanceof Error
            ? updateMutation.error.message
            : null
        }
        onSubmit={handleSubmit}
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
