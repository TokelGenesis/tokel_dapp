import React from 'react';

import styled from '@emotion/styled';

import { Colors } from 'vars/defines';

import CopyToClipboard from './CopyToClipboard';

type CopyProps = {
  textToCopy: string;
  label?: string;
  onClick?: () => void;
};

const TextInput = styled.div`
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: var(--tg-surface-2);
  padding: 8px 10px 8px 12px;
`;

const CopyWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TextWrapper = styled.p`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-family: var(--tg-font-mono);
  font-size: 12.5px;
  color: var(--tg-text);
  text-align: left;
  user-select: text;
  &:hover {
    color: var(--tg-accent-text);
    ${p => (p.onClick ? 'cursor: pointer' : '')}
  }
`;

const TextLabel = styled.p`
  font-size: 11.5px;
  font-weight: 600;
  color: var(--tg-text-2);
  margin: 0 0 3px;
`;

const CopyTextInput = ({ textToCopy, label, onClick }: CopyProps) => {
  return (
    <TextInput>
      {label && <TextLabel>{label}</TextLabel>}
      <CopyWrapper>
        <TextWrapper onClick={onClick}>{textToCopy}</TextWrapper>
        <CopyToClipboard color={Colors.WHITE} textToCopy={textToCopy} />
      </CopyWrapper>
    </TextInput>
  );
};

export default CopyTextInput;
