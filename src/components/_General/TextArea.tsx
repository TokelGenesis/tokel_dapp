import React from 'react';

import styled from '@emotion/styled';

type InputProps = {
  height: string;
  width: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  margin?: string;
};

type TextAreaType = {
  height: string;
  width: string;
};

const Styled = styled.textarea<TextAreaType>`
  background: var(--tg-input);
  border: 1px solid var(--tg-border);
  border-radius: var(--tg-radius-s);
  height: ${p => p.height};
  width: ${p => p.width};
  max-width: 100%;
  padding: 0.6rem 0.75rem;
  color: var(--tg-text);
  font-size: 13px;
  line-height: 1.5;
  font-family: var(--tg-font-mono);
  resize: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    border-color: var(--tg-accent);
    box-shadow: 0 0 0 3px var(--tg-focus);
  }
`;

const TextArea = ({ height, width, value, onChange, margin }: InputProps) => {
  return (
    <Styled
      value={value}
      onChange={onChange}
      height={height}
      width={width}
      style={{ margin: margin ?? '1rem 0' }}
    />
  );
};

export default TextArea;
