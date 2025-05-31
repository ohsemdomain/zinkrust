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
import { notify } from '~/utils/notifications';
import { trpc } from '~/lib/trpc';
import { formatters } from '~/lib/utils';
import { ProductStatus } from '../../../shared';

export const Route = createFileRoute('/products/$id')({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading: loading,
    error: queryError,
  } = trpc.products.getById.useQuery(
    { id: Number.parseInt(id) },
    { enabled: !!id },
  );

  const error = queryError instanceof Error ? queryError.message : null;

  const utils = trpc.useUtils();
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: (result) => {
      notify.success(`Product marked as ${result.status === ProductStatus.ACTIVE ? 'active' : 'inactive'}`);
      utils.products.invalidate();
      navigate({ to: '/products' });
    },
    onError: (error) => {
      notify.error(error);
    },
  });

  const handleStatusToggle = async () => {
    if (!product) return;

    const isCurrentlyActive = product.status === ProductStatus.ACTIVE;
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
      price_cents: product.price_cents,
      description: product.description || undefined,
      status: newStatus,
    };

    updateProduct.mutate(updatePayload);
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
              <strong>Category:</strong> {formatters.categoryName(product.category)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Price:</strong>{' '}
              {formatters.price(product.price_cents)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Status:</strong> {formatters.statusName(product.status)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Created:</strong>{' '}
              {formatters.date(product.created_at)}
            </Text>
          </Grid.Col>
          <Grid.Col>
            <Text>
              <strong>Updated:</strong>{' '}
              {formatters.date(product.updated_at)}
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
