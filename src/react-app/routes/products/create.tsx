import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '~/lib/trpc';

export const Route = createFileRoute('/products/create')({
  component: CreateProduct,
});

function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 1,
    price: 0,
    description: '',
    status: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      setError('Name and valid price are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description || undefined,
        status: formData.status,
      };

      console.log('Sending payload:', payload);
      console.log('Types:', {
        name: typeof payload.name,
        category: typeof payload.category,
        price: typeof payload.price,
        status: typeof payload.status,
      });

      const result = await trpc.products.create.mutate(payload);

      console.log('Created product:', result);
      navigate({ to: '/products' });
    } catch (err) {
      console.error('Create error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let convertedValue: string | number = value;

    // Convert number inputs and specific fields that should be numbers
    if (type === 'number' || name === 'category' || name === 'status') {
      convertedValue = Number.parseInt(value) || 0;
    } else if (name === 'price') {
      convertedValue = Number.parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue,
    }));
  };

  return (
    <div className="p-2">
      <h2>Create New Product</h2>

      {error && (
        <div
          className="error-message"
          style={{ color: 'red', marginBottom: '1rem' }}
        >
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value={1}>Packaging</option>
            <option value={2}>Label</option>
            <option value={3}>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter product description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/products' })}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
