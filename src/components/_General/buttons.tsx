import React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Colors } from 'vars/defines';

import DottedLoader from './_Loaders/DottedLoader';

interface ButtonProps {
  theme: string;
  customWidth?: string;
  hasIcon?: boolean;
  loading?: boolean;
}

// macOS-like buttons: primary = filled accent, the rest = quiet fills; same props as before (theme = Colors.*).
const getTheme = theme =>
  ({
    [Colors.PURPLE]: css`
      background: var(--tg-accent);
      color: var(--tg-on-accent);
      border: 1px solid transparent;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      &:hover {
        background: var(--tg-accent-hover);
      }
    `,
    [Colors.BLACK]: css`
      background: var(--tg-surface);
      color: var(--tg-text);
      border: 1px solid var(--tg-border);
      box-shadow: var(--tg-shadow-1);
      &:hover {
        background: var(--tg-surface-2);
      }
    `,
    [Colors.TRANSPARENT]: css`
      background: transparent;
      color: var(--tg-text-2);
      border: 1px solid transparent;
      &:hover {
        background: var(--tg-fill);
        color: var(--tg-text);
      }
    `,
    [Colors.DANGER]: css`
      background: var(--tg-danger);
      color: #fff;
      border: 1px solid transparent;
      &:hover {
        filter: brightness(1.06);
      }
    `,
    [Colors.SUCCESS]: css`
      background: var(--tg-success);
      color: #fff;
      border: 1px solid transparent;
      &:hover {
        filter: brightness(1.06);
      }
    `,
  }[theme] ||
  css`
    background: var(--tg-fill);
    color: var(--tg-text);
    border: 1px solid var(--tg-separator);
    &:hover {
      background: var(--tg-fill-hover);
    }
  `);

const disabledStyle = css`
  background: var(--tg-fill);
  color: var(--tg-text-3);
  border: 1px solid transparent;
  box-shadow: none;
  cursor: default;
`;

export const Button = styled.button<ButtonProps>`
  width: ${props => props.customWidth || '240px'};
  max-width: 100%;
  height: 36px;
  padding: 0 14px;
  border-radius: var(--tg-radius-s);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  position: relative;
  transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;
  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  @keyframes button-loading-spinner {
    from {
      transform: rotate(0turn);
    }
    to {
      transform: rotate(1turn);
    }
  }

  ${props =>
    props.loading &&
    css`
      text-indent: -9999em; /* hide text */
      &:after {
        content: '';
        position: absolute;
        width: 14px;
        height: 14px;
        inset: 0;
        margin: auto;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: button-loading-spinner 0.8s linear infinite;
      }
    `}

  ${props =>
    props.hasIcon &&
    `
    display: flex;
    align-items: center;
    justify-content: center;
    & > *:first-of-type {
      margin-right: 6px;
    }
  `}

  ${props => (props.disabled ? disabledStyle : getTheme(props.theme))}
`;

export const ButtonSmall = styled.button`
  height: 28px;
  border-radius: var(--tg-radius-s);
  font-size: 12px;
  font-weight: 600;
  padding: 0 10px;
  transition: background 0.15s ease, color 0.15s ease;
  ${props => getTheme(props.theme)};
`;

interface SubmitButtonProps extends ButtonProps {
  text?: React.ReactNode;
  submitting?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
}

export const SubmitButton = ({ text, submitting, disabled, ...buttonProps }: SubmitButtonProps) => (
  <Button type="submit" disabled={disabled || submitting} {...buttonProps}>
    {submitting ? <DottedLoader /> : text}
  </Button>
);
