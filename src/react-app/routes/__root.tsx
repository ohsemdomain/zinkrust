import { AppShell, Burger, Group, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => {
    const [opened, { toggle }] = useDisclosure();

    return (
      <>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: !opened },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <MantineLogo size={30} />
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <AppShell.Section>Navbar header</AppShell.Section>
            <AppShell.Section grow my="md" component={ScrollArea}>
              <Stack>
                <Link to="/" className="[&.active]:font-bold">
                  Dashboard
                </Link>{' '}
                <Link to="/products" className="[&.active]:font-bold">
                  Products
                </Link>
              </Stack>
            </AppShell.Section>
            <AppShell.Section>
              Navbar footer – always at the bottom
            </AppShell.Section>
          </AppShell.Navbar>
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </>
    );
  },
});
