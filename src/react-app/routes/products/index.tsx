import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link, createFileRoute } from '@tanstack/react-router';
import { trpc } from '~/lib/trpc';

export const Route = createFileRoute('/products/')({
  component: Products,
});

function Products() {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = trpc.products.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });

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
    const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
    
    return (
      <Container>
        <Title order={2} mb="md">Products</Title>
        <Alert 
          color="red" 
          title="Error Loading Products"
          variant="light"
        >
          <Stack gap="sm">
            <Text size="sm">{errorMessage}</Text>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
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
      {products.length === 0 ? (
        <Alert variant="light" color="blue" title="No Products Found">
          <Stack gap="sm">
            <Text size="sm">No products have been created yet.</Text>
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
                    <strong>Category:</strong> {getCategoryName(product.category)}
                  </Text>
                  
                  <Text size="sm">
                    <strong>Price:</strong> ${product.price}
                  </Text>
                  
                  <Badge 
                    color={product.status === 1 ? 'green' : 'gray'}
                    variant="light"
                  >
                    {getStatusName(product.status)}
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
    </Container>
  );
}
