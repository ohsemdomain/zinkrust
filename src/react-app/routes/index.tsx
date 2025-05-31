import {
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { ArrowRight, DollarSign, Package, TrendingUp } from 'lucide-react';
import { trpc } from '~/lib/trpc';
import { PriceUtils, ProductStatus } from '../../shared';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const { data: activeProducts, isLoading: loadingActive } =
    trpc.products.getAll.useQuery({
      filter_by: 'active',
      per_page: 100,
    });

  const { data: allProducts, isLoading: loadingAll } =
    trpc.products.getAll.useQuery({
      filter_by: 'all',
      per_page: 100,
    });

  if (loadingActive || loadingAll) {
    return (
      <Container>
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text>Loading dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  const activeCount = activeProducts?.total || 0;
  const totalCount = allProducts?.total || 0;
  const inactiveCount = totalCount - activeCount;

  const totalValue =
    allProducts?.products.reduce(
      (sum, product) =>
        sum +
        (product.status === ProductStatus.ACTIVE ? product.price_cents : 0),
      0,
    ) || 0;

  const avgPrice = activeCount > 0 ? totalValue / activeCount : 0;

  return (
    <Container>
      <Stack gap="xl">
        <div>
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed">Overview of your product inventory</Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Total Products</Text>
                <Package size={20} />
              </Group>
              <Text size="xl" fw={700}>
                {totalCount}
              </Text>
              <Text size="sm" c="dimmed">
                All products in system
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Active Products</Text>
                <TrendingUp size={20} color="green" />
              </Group>
              <Text size="xl" fw={700} c="green">
                {activeCount}
              </Text>
              <Text size="sm" c="dimmed">
                {inactiveCount} inactive
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Total Value</Text>
                <DollarSign size={20} />
              </Group>
              <Text size="xl" fw={700}>
                {PriceUtils.formatPrice(totalValue)}
              </Text>
              <Text size="sm" c="dimmed">
                Active products only
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Average Price</Text>
                <DollarSign size={20} />
              </Group>
              <Text size="xl" fw={700}>
                {PriceUtils.formatPrice(avgPrice)}
              </Text>
              <Text size="sm" c="dimmed">
                Per active product
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Quick Actions
          </Title>
          <Stack gap="md">
            <Link to="/products">
              <Group justify="space-between" style={{ cursor: 'pointer' }}>
                <div>
                  <Text fw={500}>View All Products</Text>
                  <Text size="sm" c="dimmed">
                    Browse and manage your product inventory
                  </Text>
                </div>
                <ArrowRight size={20} />
              </Group>
            </Link>

            <Link to="/products/create">
              <Group justify="space-between" style={{ cursor: 'pointer' }}>
                <div>
                  <Text fw={500}>Add New Product</Text>
                  <Text size="sm" c="dimmed">
                    Create a new product entry
                  </Text>
                </div>
                <ArrowRight size={20} />
              </Group>
            </Link>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
