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
import { trpc } from '~/lib/trpc';

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
    { enabled: !!id }
  );
  
  const error = queryError instanceof Error ? queryError.message : null;

  const getCategoryName = (category: number) => {
    switch (category) {
      case 1:
        return 'Packaging';
      case 2:
        return 'Label';
      case 3:
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      navigate({ to: '/products' });
    },
    onError: (err) => {
      console.error('Delete error:', err);
    },
  });

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate({ id: product.id });
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
              <strong>Status:</strong>{' '}
              {product.status === 1 ? 'Active' : 'Inactive'}
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
          <Button color="red" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
