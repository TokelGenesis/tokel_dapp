import React from 'react';

import styled from '@emotion/styled';

type InputProps = {
  title: string;
  subtitle?: Array<string | JSX.Element>;
};

// An empty state: a quiet title and, below it, a line of help (macOS style, no capitals).
const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 36px 24px;
  color: var(--tg-text-2);
  b {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--tg-text-2);
  }
  span {
    font-size: 12.5px;
    color: var(--tg-text-3);
    max-width: 420px;
  }
`;

const InfoNote = ({ title, subtitle }: InputProps) => (
  <Message>
    <b>{title}</b>
    {subtitle && subtitle.length > 0 && <span>{subtitle}</span>}
  </Message>
);

InfoNote.defaultProps = {
  subtitle: '',
};

export default InfoNote;
