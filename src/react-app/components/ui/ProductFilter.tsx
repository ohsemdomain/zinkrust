import { Select } from '@mantine/core';

interface ProductFilterProps {
  value: 'active' | 'inactive' | 'all';
  onChange: (value: 'active' | 'inactive' | 'all') => void;
}

export function ProductFilter({ value, onChange }: ProductFilterProps) {
  const options = [
    { value: 'active', label: 'Active Products' },
    { value: 'inactive', label: 'Inactive Products' },
    { value: 'all', label: 'All Products' },
  ];

  return (
    <Select
      label="Filter Products"
      value={value}
      onChange={(val) => onChange(val as 'active' | 'inactive' | 'all')}
      data={options}
      style={{ minWidth: 200 }}
    />
  );
}