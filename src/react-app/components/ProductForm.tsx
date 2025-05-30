import type { ChangeEvent, FormEvent } from 'react';
import { ProductCategory, ProductStatus } from '../../shared/constants';
import type {
  CreateProduct,
  UpdateProduct,
} from '../../worker/schemas/products';

type FormData = Omit<CreateProduct, 'status'> & { status?: number };

interface ProductFormProps {
  formData: FormData;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (data: FormData) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function ProductForm({
  formData,
  isSubmitting,
  error,
  onSubmit,
  onChange,
  onCancel,
  submitLabel,
}: ProductFormProps) {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let convertedValue: string | number = value;

    if (name === 'category' || name === 'status') {
      convertedValue = Number.parseInt(value) || 0;
    } else if (name === 'price') {
      convertedValue = Number.parseFloat(value) || 0;
    }

    onChange({
      ...formData,
      [name]: convertedValue,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a category</option>
          <option value={ProductCategory.PACKAGING}>Packaging</option>
          <option value={ProductCategory.LABEL}>Label</option>
          <option value={ProductCategory.OTHER}>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          step="0.01"
          min="0"
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          name="status"
          value={formData.status ?? ProductStatus.ACTIVE}
          onChange={handleInputChange}
          required
        >
          <option value={ProductStatus.ACTIVE}>Active</option>
          <option value={ProductStatus.INACTIVE}>Inactive</option>
        </select>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>
      )}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
