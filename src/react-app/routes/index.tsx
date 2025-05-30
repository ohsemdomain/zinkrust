import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div>
      <h1>Redirecting to Dashboard...</h1>
    </div>
  ),
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard',
    });
  },
});
