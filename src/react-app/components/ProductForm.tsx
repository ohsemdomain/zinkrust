import { Button, Group, NumberInput, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { ProductCategory } from '../../shared/constants';
import type { CreateProduct } from '../../worker/schemas/products';

interface ProductFormProps {
  initialValues?: Partial<CreateProduct>;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: CreateProduct) => void;
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
  const form = useForm<CreateProduct>({
    initialValues: {
      name: '',
      category: 0,
      price: 0,
      description: '',
      ...initialValues,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      price: (value) => (value <= 0 ? 'Price must be positive' : null),
    },
  });

  // Update form values when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      form.setValues({
        name: initialValues.name || '',
        category: initialValues.category || 0,
        price: initialValues.price || 0,
        description: initialValues.description || '',
      });
    }
  }, [initialValues]);

  const handleSubmit = (values: CreateProduct) => {
    onSubmit(values);
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
          onChange={(value) => form.setFieldValue('category', Number(value) || 0)}
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
          {...form.getInputProps('price')}
        />

        <Textarea
          label="Description"
          placeholder="Enter product description (optional)"
          autosize
          minRows={3}
          maxRows={6}
          {...form.getInputProps('description')}
        />

        {error && (
          <div style={{ color: 'red' }}>Error: {error}</div>
        )}

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