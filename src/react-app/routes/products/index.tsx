import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '~/lib/trpc';
import { getCategoryName, getStatusText } from '~/utils/product.utils';
import { ProductStatus } from '../../../shared/constants';

export const Route = createFileRoute('/products/')({
  component: Products,
});

function Products() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const limit = 12;

  const { data, isLoading, error, refetch } = trpc.products.getAll.useQuery(
    { limit, offset: page * limit, status: statusFilter },
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      keepPreviousData: true,
    },
  );
  
  // Reset page when status filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as 'active' | 'inactive' | 'all');
    setPage(0);
  };

  const products = data?.products || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <Container>
        <Stack align="center" py="xl">
          <Loader size="lg" />
        </Stack>
      </Container>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load products';

    return (
      <Container>
        <Title order={2} mb="md">
          Products
        </Title>
        <Alert color="red" title="Error Loading Products" variant="light">
          <Stack gap="sm">
            <Text size="sm">{errorMessage}</Text>
            <Button variant="light" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack gap="md" mb="md">
        <Grid justify="space-between" align="center">
          <Grid.Col span="auto">
            <Title order={2}>Products</Title>
          </Grid.Col>
          <Grid.Col span="content">
            <Button component={Link} to="/products/create">
              Add New Product
            </Button>
          </Grid.Col>
        </Grid>
        
        <Group>
          <Text size="sm" fw={500}>Show:</Text>
          <SegmentedControl
            value={statusFilter}
            onChange={handleStatusFilterChange}
            data={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'All', value: 'all' },
            ]}
          />
        </Group>
      </Stack>
      {products.length === 0 ? (
        <Alert variant="light" color="blue" title="No Products Found">
          <Stack gap="sm">
            <Text size="sm">
              {statusFilter === 'active' && 'No active products found.'}
              {statusFilter === 'inactive' && 'No inactive products found.'}
              {statusFilter === 'all' && 'No products have been created yet.'}
            </Text>
            <Button
              component={Link}
              to="/products/create"
              variant="light"
              size="sm"
            >
              Create Your First Product
            </Button>
          </Stack>
        </Alert>
      ) : (
        <Grid>
          {products.map((product) => (
            <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card padding="lg" withBorder h="100%">
                <Stack gap="sm">
                  <Title order={3}>
                    <Link
                      to="/products/$id"
                      params={{ id: product.id.toString() }}
                      style={{ color: '#228be6', textDecoration: 'none' }}
                    >
                      {product.name}
                    </Link>
                  </Title>

                  <Text size="sm" c="dimmed">
                    <strong>ID:</strong> {product.id}
                  </Text>

                  <Text size="sm">
                    <strong>Category:</strong>{' '}
                    {getCategoryName(product.category)}
                  </Text>

                  <Text size="sm">
                    <strong>Price:</strong> ${product.price}
                  </Text>

                  <Badge
                    color={
                      product.status === ProductStatus.ACTIVE ? 'green' : 'gray'
                    }
                    variant="light"
                  >
                    {getStatusText(product.status)}
                  </Badge>

                  {product.description && (
                    <Text size="sm">
                      <strong>Description:</strong> {product.description}
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Button
            variant="light"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Text size="sm">
            Page {page + 1} of {totalPages}
          </Text>
          <Button
            variant="light"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </Group>
      )}
    </Container>
  );
}
