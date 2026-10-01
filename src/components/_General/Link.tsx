import React from 'react';

import styled from '@emotion/styled';

type InputProps = {
  linkText: string;
  onClick: () => void;
};

const Styled = styled.button`
  border: none;
  color: var(--tg-accent-text);
  background-color: transparent;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--tg-radius-s);
  transition: background 0.15s ease;
  &:hover {
    background: var(--tg-accent-soft);
  }
`;

const Link = ({ linkText, onClick }: InputProps) => {
  return (
    <Styled type="button" onClick={onClick}>
      {linkText}
    </Styled>
  );
};

export default Link;
