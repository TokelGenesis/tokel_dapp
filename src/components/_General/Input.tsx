import React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import ErrorMessage from './ErrorMessage';

const InputRoot = styled.div`
  display: flex;
  align-items: center;
`;

type StyledInputProps = {
  width: string;
  icon?: boolean;
  disabled: boolean;
};

export const StyledInput = styled.input<StyledInputProps>`
  background: var(--tg-input);
  border: 1px solid var(--tg-border);
  border-radius: var(--tg-radius-s);
  height: 36px;
  padding-left: ${({ icon }) => (icon ? '2.25rem' : '0.75rem')};
  padding-right: 0.75rem;
  color: var(--tg-text);
  font-size: 13px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &::placeholder {
    color: var(--tg-text-3);
  }
  &:focus {
    border-color: var(--tg-accent);
    box-shadow: 0 0 0 3px var(--tg-focus);
  }
  ${({ width }) => (width === 'flex' ? { flexGrow: 1 } : { width })}
  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          opacity: 0.9;
          color: var(--color-gray);
        `
      : ''}
`;

export const IconImg = styled.img`
  position: absolute;
  margin-left: 0.7rem;
`;

type InputProps = {
  id?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  icon?: string;
  placeholder?: string;
  autoFocus?: boolean;
  width?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  tid?: string;
};

const Input = ({
  id,
  value,
  onChange,
  onKeyDown,
  icon,
  placeholder,
  autoFocus,
  width = '240px',
  type = 'text',
  disabled,
  error,
  tid,
}: InputProps) => {
  return (
    <InputRoot>
      {icon && <IconImg src={icon} />}
      <StyledInput
        id={id}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        width={width}
        icon={icon !== ''}
        type={type}
        data-tid={tid}
        disabled={disabled}
      />
      {error && (
        <div style={{ textAlign: 'right' }}>
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}
    </InputRoot>
  );
};

export default Input;
