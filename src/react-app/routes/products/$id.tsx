import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { trpc } from '~/lib/trpc';
import type { Product } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/$id')({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const result = await trpc.products.getById.query({
          id: Number.parseInt(id),
        });
        setProduct(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

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

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await trpc.products.delete.mutate({ id: product.id });
      navigate({ to: '/products' });
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-2">
        <h2>Product Details</h2>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-2">
        <h2>Product Details</h2>
        <p style={{ color: 'red' }}>Error: {error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2>Product Details</h2>
      <div className="product-detail">
        <h3>{product.name}</h3>
        <div className="detail-grid">
          <div>
            <strong>ID:</strong> {product.id}
          </div>
          <div>
            <strong>Category:</strong> {getCategoryName(product.category)}
          </div>
          <div>
            <strong>Price:</strong> ${product.price}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            {product.status === 1 ? 'Active' : 'Inactive'}
          </div>
          <div>
            <strong>Created:</strong>{' '}
            {new Date(product.created_at * 1000).toLocaleDateString()}
          </div>
          <div>
            <strong>Updated:</strong>{' '}
            {new Date(product.updated_at * 1000).toLocaleDateString()}
          </div>
        </div>
        {product.description && (
          <div className="description">
            <strong>Description:</strong>
            <p>{product.description}</p>
          </div>
        )}

        <div className="product-actions">
          <Link
            to="/products/edit/$id"
            params={{ id: product.id.toString() }}
            className="btn-primary"
          >
            Edit Product
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
