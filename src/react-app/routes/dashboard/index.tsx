import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import reactLogo from '~/assets/react.svg';

export const Route = createFileRoute('/dashboard/')({
  component: Dashboard,
});

function Dashboard() {
  const [name, setName] = useState('unknown');

  return (
    <div className="p-2">
      <div>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Dashboard</h1>
      <div className="card">
        <button
          type="button"
          onClick={() => {
            fetch('/api/')
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName(data.name));
          }}
          aria-label="get name"
        >
          Name from API is: {name}
        </button>
        <p>
          Edit <code>worker/index.ts</code> to change the name
        </p>
      </div>
    </div>
  );
}
