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
import { ProductCategory } from '../../shared/constants';
import type { CreateProductInput } from '../../shared/types';

// Form-specific type that works with dollars
type ProductFormData = {
  name: string;
  category: number;
  price: number; // dollars
  description?: string;
};

interface ProductFormProps {
  initialValues?: Partial<CreateProductInput>;
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
  const form = useForm<ProductFormData>({
    initialValues: {
      name: initialValues?.name || '',
      category: initialValues?.category || 0,
      price: initialValues?.price_cents ? initialValues.price_cents / 100 : 0,
      description: initialValues?.description || '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      price: (value) => (value <= 0 ? 'Price must be positive' : null),
    },
  });

  // Form initializes with correct values from initialValues prop

  const handleSubmit = (values: ProductFormData) => {
    // Convert dollars to cents before sending to backend
    const submissionData = {
      name: values.name,
      category: values.category,
      price_cents: Math.round(values.price * 100), // Convert dollars to cents here
      description: values.description,
    };
    onSubmit(submissionData as CreateProductInput);
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
            form.setFieldValue('price', (typeof val === 'number' ? val : 0));
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
