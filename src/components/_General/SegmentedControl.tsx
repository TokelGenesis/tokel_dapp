import React from 'react';

import styled from '@emotion/styled';

// macOS segmented control: one rounded track, the chosen segment raised.
const Track = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: var(--tg-fill);
`;

const Segment = styled.button<{ active: boolean }>`
  height: 26px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  color: ${p => (p.active ? 'var(--tg-text)' : 'var(--tg-text-2)')};
  background: ${p => (p.active ? 'var(--tg-surface)' : 'transparent')};
  box-shadow: ${p => (p.active ? 'var(--tg-shadow-1)' : 'none')};
  transition: background 0.12s ease, color 0.12s ease;
  &:hover {
    color: var(--tg-text);
  }
`;

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  tid?: string;
};

const SegmentedControl = <T extends string>({ options, value, onChange, label, tid }: Props<T>) => (
  <Track role="radiogroup" aria-label={label} data-tid={tid}>
    {options.map(o => (
      <Segment
        key={o.value}
        type="button"
        role="radio"
        aria-checked={o.value === value}
        active={o.value === value}
        data-value={o.value}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </Segment>
    ))}
  </Track>
);

export default SegmentedControl;
