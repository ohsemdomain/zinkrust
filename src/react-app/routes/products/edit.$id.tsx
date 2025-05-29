import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { trpc } from '~/lib/trpc';
import type { Product } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/edit/$id')({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 1,
    price: 0,
    description: '',
    status: 1,
  });

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const result = await trpc.products.getById.query({
          id: Number.parseInt(id),
        });
        setProduct(result);

        // Pre-populate form
        setFormData({
          name: result.name,
          category: result.category,
          price: result.price,
          description: result.description || '',
          status: result.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || !product) {
      setError('Name and valid price are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        id: product.id,
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description || undefined,
        status: formData.status,
      };

      console.log('Updating product:', payload);

      const result = await trpc.products.update.mutate(payload);

      console.log('Updated product:', result);
      navigate({ to: '/products/$id', params: { id: product.id.toString() } });
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
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

  if (loadingProduct) {
    return (
      <div className="p-2">
        <h2>Edit Product</h2>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-2">
        <h2>Edit Product</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2>Edit Product</h2>

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
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate({
                to: '/products/$id',
                params: { id: product?.id.toString() || '' },
              })
            }
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
