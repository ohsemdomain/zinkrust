import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className="p-2">
      <h2>About</h2>
      <p>This is a React application built with:</p>
      <ul>
        <li>Vite for fast development</li>
        <li>TanStack Router for file-based routing</li>
        <li>Hono for the backend API</li>
        <li>Cloudflare Workers for deployment</li>
      </ul>
    </div>
  );
}
