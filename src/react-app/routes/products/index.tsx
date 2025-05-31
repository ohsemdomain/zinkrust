import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { trpc } from '~/lib/trpc';
import { formatters } from '~/lib/utils';
import { ProductStatus } from '../../../shared';

const searchSchema = z.object({
  filter_by: z.enum(['active', 'inactive', 'all']).optional().default('active'),
  page: z.number().optional().default(0),
  per_page: z.number().optional().default(25),
  sort_column: z
    .enum(['name', 'category', 'status', 'created_at', 'updated_at'])
    .optional()
    .default('created_at'),
  sort_order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export const Route = createFileRoute('/products/')({
  validateSearch: searchSchema,
  component: Products,
});

function Products() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const {
    filter_by = 'active',
    page = 0,
    per_page = 25,
    sort_column = 'created_at',
    sort_order = 'DESC',
  } = search;

  const { data, isLoading, error, refetch } = trpc.products.getAll.useQuery(
    { filter_by, page, per_page, sort_column, sort_order },
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      placeholderData: (previousData) => previousData,
    },
  );

  const handleFilterChange = (newFilter: 'active' | 'inactive' | 'all') => {
    navigate({
      to: '/products',
      search: { ...search, filter_by: newFilter, page: 0 },
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/products',
      search: { ...search, page: newPage },
    });
  };

  const handleSortChange = (column: string, order: 'ASC' | 'DESC') => {
    navigate({
      to: '/products',
      search: {
        ...search,
        sort_column: column as typeof search.sort_column,
        sort_order: order,
        page: 0,
      },
    });
  };

  const products = data?.products || [];
  const hasMore = data?.hasMore || false;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage || 0;

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
          <Select
            label="Filter Products"
            value={filter_by}
            onChange={(value) =>
              handleFilterChange(value as 'active' | 'inactive' | 'all')
            }
            data={[
              { value: 'active', label: 'Active Products' },
              { value: 'inactive', label: 'Inactive Products' },
              { value: 'all', label: 'All Products' },
            ]}
            style={{ minWidth: 200 }}
          />
          <Select
            label="Sort By"
            value={`${sort_column}-${sort_order}`}
            onChange={(value) => {
              if (value) {
                const [column, order] = value.split('-');
                handleSortChange(column, order as 'ASC' | 'DESC');
              }
            }}
            data={[
              { value: 'name-ASC', label: 'Name (A-Z)' },
              { value: 'name-DESC', label: 'Name (Z-A)' },
              { value: 'created_at-DESC', label: 'Newest First' },
              { value: 'created_at-ASC', label: 'Oldest First' },
            ]}
            style={{ minWidth: 200 }}
          />
        </Group>
      </Stack>

      {products.length === 0 ? (
        <Alert variant="light" color="blue" title="No Products Found">
          <Stack gap="sm">
            <Text size="sm">
              {filter_by === 'active' && 'No active products found.'}
              {filter_by === 'inactive' && 'No inactive products found.'}
              {filter_by === 'all' && 'No products have been created yet.'}
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
                    {formatters.categoryName(product.category)}
                  </Text>

                  <Text size="sm">
                    <strong>Price:</strong>{' '}
                    {formatters.price(product.price_cents)}
                  </Text>

                  <Badge
                    color={
                      product.status === ProductStatus.ACTIVE ? 'green' : 'gray'
                    }
                    variant="light"
                  >
                    {formatters.statusName(product.status)}
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
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Text size="sm">
            Page {currentPage + 1} of {totalPages}
          </Text>
          <Button
            variant="light"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </Group>
      )}
    </Container>
  );
}
