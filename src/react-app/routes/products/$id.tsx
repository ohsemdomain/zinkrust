import {
  Alert,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useNotifications } from '~/contexts/NotificationContext';
import { trpc } from '~/lib/trpc';
import { useProductMutations } from '~/hooks/useProductMutations';
import { getCategoryName, getStatusText } from '~/utils/product.utils';
import { ProductStatus } from '../../../shared/constants';

export const Route = createFileRoute('/products/$id')({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const {
    data: product,
    isLoading: loading,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const error = queryError instanceof Error ? queryError.message : null;

  const { updateProduct } = useProductMutations();

  const handleStatusToggle = async () => {
    if (!product) return;

    const isCurrentlyActive = product.status === ProductStatus.ACTIVE;
    const action = isCurrentlyActive ? 'inactive' : 'active';
    const confirmMessage = isCurrentlyActive
      ? `Are you sure you want to mark "${product.name}" as inactive? You can view it later in the inactive products list.`
      : `Are you sure you want to mark "${product.name}" as active? It will appear in the active products list.`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    const newStatus = isCurrentlyActive
      ? ProductStatus.INACTIVE
      : ProductStatus.ACTIVE;

    const updatePayload = {
      id: product.id,
      name: product.name,
      category: product.category,
      price:
        typeof product.price === 'string'
          ? Number.parseFloat(product.price)
          : product.price,
      description: product.description || undefined,
      status: newStatus,
    };

    console.log('Updating product with payload:', updatePayload);

    updateProduct.mutate(updatePayload, {
      onSuccess: () => {
        showNotification('success', `Product marked as ${action}`);
        navigate({ to: '/products' });
      },
      onError: (err) => {
        console.error('Update status error:', err);
        const errorMessage =
          (err as any)?.message ||
          (err as any)?.data?.message ||
          'Failed to update product status';
        showNotification('error', errorMessage);
      },
    });
  };

  if (loading) {
    return (
      <Container>
        <Stack align="center" py="xl">
          <Loader size="lg" />
        </Stack>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <Title order={2}>Product Details</Title>
        <Alert color="red">Error: {error || 'Product not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Title order={2}>Product Details</Title>
      <Stack>
        <Title order={3}>{product.name}</Title>
        <Grid>
          <Grid.Col>
            <Text>
              <strong>ID:</strong> {product.id}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Category:</strong> {getCategoryName(product.category)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Price:</strong> ${product.price}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Status:</strong> {getStatusText(product.status)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Created:</strong>{' '}
              {new Date(product.created_at * 1000).toLocaleDateString()}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Updated:</strong>{' '}
              {new Date(product.updated_at * 1000).toLocaleDateString()}
            </Text>
          </Grid.Col>
        </Grid>
        {product.description && (
          <Stack gap="xs">
            <Text>
              <strong>Description:</strong>
            </Text>
            <Text>{product.description}</Text>
          </Stack>
        )}

        <Group>
          <Link to="/products/edit/$id" params={{ id: product.id.toString() }}>
            <Button>Edit Product</Button>
          </Link>
          {product.status === ProductStatus.ACTIVE ? (
            <Button
              color="red"
              onClick={handleStatusToggle}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? 'Updating...' : 'Mark as Inactive'}
            </Button>
          ) : (
            <Button
              color="green"
              onClick={handleStatusToggle}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? 'Updating...' : 'Mark as Active'}
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}
