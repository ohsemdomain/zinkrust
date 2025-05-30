import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Loader,
  Text,
  Title,
} from '@mantine/core';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { trpc } from '~/lib/trpc';
import type { Product } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/')({
  component: Products,
});

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await trpc.products.getAll.query();
        setProducts(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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

  const getStatusName = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title order={2}>Products</Title>
        <Alert color="red">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Grid justify="space-between" align="center" mb="md">
        <Grid.Col span="auto">
          <Title order={2}>Products</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <Button component={Link} to="/products/create">
            Add New Product
          </Button>
        </Grid.Col>
      </Grid>
      <Grid>
        {products.map((product) => (
          <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card padding="lg" withBorder>
              <Title order={3}>
                <Link
                  to="/products/$id"
                  params={{ id: product.id.toString() }}
                  style={{ color: '#228be6', textDecoration: 'none' }}
                >
                  {product.name}
                </Link>
              </Title>
              <Text>
                <strong>ID:</strong> {product.id}
              </Text>
              <Text>
                <strong>Category:</strong> {getCategoryName(product.category)}
              </Text>
              <Text>
                <strong>Price:</strong> ${product.price}
              </Text>
              <Badge color={product.status === 1 ? 'green' : 'gray'}>
                {getStatusName(product.status)}
              </Badge>
              {product.description && (
                <Text>
                  <strong>Description:</strong> {product.description}
                </Text>
              )}
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
