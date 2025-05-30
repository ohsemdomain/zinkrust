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
import { useEffect, useState } from 'react';
import { trpc } from '~/lib/trpc';
import type { Product } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/$id')({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const result = await trpc.products.getById.query({
          id: Number.parseInt(id),
        });
        setProduct(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

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

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await trpc.products.delete.mutate({ id: product.id });
      navigate({ to: '/products' });
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title order={2}>Product Details</Title>
        <Loader />
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
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
