import React from 'react';

import styled from '@emotion/styled';

import CopyToClipboard from 'components/_General/CopyToClipboard';

type CredentialsRowProps = {
  label: string;
  sublabel: string;
  credential: string;
  tid?: string;
};

const Row = styled.div`
  padding: 12px 14px;
  & + & {
    border-top: 1px solid var(--tg-separator);
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  b {
    font-size: 12.5px;
    font-weight: 600;
  }
  span {
    font-size: 12px;
    color: var(--tg-text-2);
  }
`;

const Secret = styled.p`
  margin: 0;
  font-family: var(--tg-font-mono);
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  user-select: text;
`;

const CredentialsRow = ({ label, sublabel, credential, tid }: CredentialsRowProps) => (
  <Row>
    <Head>
      <div>
        <b>{label}</b> <span>{sublabel}</span>
      </div>
      <CopyToClipboard textToCopy={credential} />
    </Head>
    <Secret data-tid={tid}>{credential}</Secret>
  </Row>
);

export default CredentialsRow;
