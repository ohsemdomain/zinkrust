import { Container, Loader, Stack } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { useNotification } from '~/hooks/useNotification';
import { trpc } from '~/lib/trpc';
import { useProductMutations } from '~/hooks/useProductMutations';
import type {
  CreateProductInput,
  UpdateProductInput,
} from '../../../shared/types';

export const Route = createFileRoute('/products/edit/$id')({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const {
    data: product,
    isLoading: loadingProduct,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const { updateProduct } = useProductMutations();

  const handleSubmit = (values: CreateProductInput) => {
    if (!product) return;

    const payload: UpdateProductInput = {
      id: product.id,
      ...values,
      status: product.status,
    };

    updateProduct.mutate(payload, {
      onSuccess: (result) => {
        showSuccess(`Product "${result.name}" updated successfully`);
        navigate({
          to: '/products/$id',
          params: { id: result.id.toString() },
        });
      },
      onError: (error) => {
        showError(error);
      },
    });
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
        isSubmitting={updateProduct.isPending}
        error={updateProduct.error?.message || null}
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
