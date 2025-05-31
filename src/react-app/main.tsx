import { MantineProvider } from '@mantine/core';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './_styles.css';
import { theme } from './_theme';
import { TRPCProvider } from './components/TRPCProvider';
import { APP_CONFIG } from '../shared';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <TRPCProvider>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
        <Toaster
          toastOptions={{
            duration: APP_CONFIG.ui.notifications.autoHideDelay,
            style: {
              border: '1px solid var(--mantine-color-gray-1)',
              padding: '16px',
              textAlign: 'left',
            },
          }}
        />
      </MantineProvider>
    </TRPCProvider>
  </StrictMode>,
);
