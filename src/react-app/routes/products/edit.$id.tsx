import { Container, Loader, Stack } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProductForm } from '~/components/ProductForm';
import { trpc } from '~/lib/trpc';
import { notify } from '~/utils/notifications';
import type { CreateProductInput, UpdateProductInput } from '../../../shared';
import { type ProductCategory, ProductStatus } from '../../../shared';

export const Route = createFileRoute('/products/edit/$id')({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const {
    data: product,
    isLoading: loadingProduct,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const utils = trpc.useUtils();
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: (result) => {
      notify.success(`Product "${result.name}" updated successfully`);
      utils.products.invalidate();
      navigate({
        to: '/products/$id',
        params: { id: result.id.toString() },
      });
    },
    onError: (error) => {
      notify.error(error);
    },
  });

  const handleSubmit = (values: CreateProductInput) => {
    if (!product) return;

    // Validate status is valid before using
    const status =
      product.status === ProductStatus.ACTIVE
        ? ProductStatus.ACTIVE
        : ProductStatus.INACTIVE;

    const payload: UpdateProductInput = {
      id: product.id,
      ...values,
      status,
    };

    updateProduct.mutate(payload);
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
                category: product.category as
                  | typeof ProductCategory.PACKAGING
                  | typeof ProductCategory.LABEL
                  | typeof ProductCategory.OTHER,
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
