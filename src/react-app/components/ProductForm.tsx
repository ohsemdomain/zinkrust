import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  type CreateProductInput,
  type Product,
  ProductCategory,
  formTransformers,
} from '../../shared';

// Form-specific type that works with dollars
type ProductFormData = {
  name: string;
  category: number;
  price: number; // dollars
  description?: string;
};

interface ProductFormProps {
  initialValues?: Partial<CreateProductInput> | Partial<Product>;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: CreateProductInput) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function ProductForm({
  initialValues = {},
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel,
}: ProductFormProps) {
  // ==================== CONVERSION HELPERS ====================

  /**
   * Transform API data (cents) to form data (dollars) for editing
   */
  const transformFromAPI = (
    apiData: Partial<CreateProductInput> | Partial<Product>,
  ): ProductFormData => {
    if (!apiData.price_cents) {
      return {
        name: apiData.name || '',
        category: apiData.category || ProductCategory.PACKAGING,
        price: 0,
        description: apiData.description || '',
      };
    }

    const transformed = formTransformers.productApiToForm({
      name: apiData.name || '',
      category: apiData.category || ProductCategory.PACKAGING,
      price_cents: apiData.price_cents,
      description: apiData.description || '',
    });

    return {
      name: transformed.name,
      category: transformed.category,
      price: transformed.price,
      description: transformed.description,
    };
  };

  /**
   * Transform form data (dollars) to API data (cents) for submission
   */
  const transformToAPI = (formData: ProductFormData): CreateProductInput => {
    const transformed = formTransformers.productFormToApi(formData);
    return {
      name: transformed.name,
      category: transformed.category as 1 | 2 | 3,
      price_cents: transformed.price_cents,
      description: transformed.description,
    };
  };

  // ==================== FORM SETUP ====================

  const form = useForm<ProductFormData>({
    initialValues: transformFromAPI(initialValues),
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      price: (value) => (value <= 0 ? 'Price must be positive' : null),
    },
  });

  // ==================== FORM SUBMISSION ====================

  const handleSubmit = (values: ProductFormData) => {
    const submissionData = transformToAPI(values);
    onSubmit(submissionData);
  };

  const categoryOptions = [
    { value: String(ProductCategory.PACKAGING), label: 'Packaging' },
    { value: String(ProductCategory.LABEL), label: 'Label' },
    { value: String(ProductCategory.OTHER), label: 'Other' },
  ];

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Enter product name"
          required
          {...form.getInputProps('name')}
        />

        <Select
          label="Category"
          placeholder="Select a category"
          required
          data={categoryOptions}
          value={String(form.values.category || '')}
          onChange={(value) =>
            form.setFieldValue('category', Number(value) || 0)
          }
          error={form.errors.category}
        />

        <NumberInput
          label="Price"
          placeholder="Enter price"
          required
          min={0}
          step={0.01}
          decimalScale={2}
          fixedDecimalScale
          hideControls
          value={form.values.price || 0}
          onChange={(val) => {
            form.setFieldValue('price', typeof val === 'number' ? val : 0);
          }}
          error={form.errors.price}
        />

        <Textarea
          label="Description"
          placeholder="Enter product description (optional)"
          autosize
          minRows={3}
          maxRows={6}
          {...form.getInputProps('description')}
        />

        {error && <div style={{ color: 'red' }}>Error: {error}</div>}

        <Group>
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
