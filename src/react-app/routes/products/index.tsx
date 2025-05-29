import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { trpc } from '~/lib/trpc';
import type { Product } from '../../../worker/schemas/products';

export const Route = createFileRoute('/products/')({
  component: Products,
});

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await trpc.products.getAll.query();
        setProducts(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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

  if (loading) {
    return (
      <div className="p-2">
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2">
        <h2>Products</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="products-header">
        <h2>Products</h2>
        <Link to="/products/create" className="btn-primary">
          Add New Product
        </Link>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>
              <Link
                to="/products/$id"
                params={{ id: product.id.toString() }}
                className="product-link"
              >
                {product.name}
              </Link>
            </h3>
            <p>
              <strong>Category:</strong> {getCategoryName(product.category)}
            </p>
            <p>
              <strong>Price:</strong> ${product.price}
            </p>
            <p>
              <strong>Status:</strong> {getStatusName(product.status)}
            </p>
            {product.description && (
              <p>
                <strong>Description:</strong> {product.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
