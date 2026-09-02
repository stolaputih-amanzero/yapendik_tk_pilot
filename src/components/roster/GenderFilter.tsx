import React from 'react';
import { SegmentedControl, SegmentedControlOption } from '../ui/SegmentedControl';

export type GenderFilterValue = 'ALL' | 'Laki-laki' | 'Perempuan';

export interface GenderFilterProps {
  value: GenderFilterValue;
  onChange: (value: GenderFilterValue) => void;
  counts: {
    all: number;
    male: number;
    female: number;
  };
  className?: string;
}

export const GenderFilter: React.FC<GenderFilterProps> = ({
  value,
  onChange,
  counts,
  className = '',
}) => {
  const options: SegmentedControlOption[] = [
    {
      id: 'ALL',
      label: 'Semua',
      badge: counts.all,
    },
    {
      id: 'Laki-laki',
      label: 'Laki-laki',
      badge: counts.male,
    },
    {
      id: 'Perempuan',
      label: 'Perempuan',
      badge: counts.female,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <SegmentedControl
        options={options}
        value={value}
        onChange={(val) => onChange(val as GenderFilterValue)}
        size="md"
        className="w-full justify-center"
      />
    </div>
  );
};
