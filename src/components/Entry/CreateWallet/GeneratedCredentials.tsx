import React from 'react';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import links from 'util/links';

import { Button } from 'components/_General/buttons';
import Warning from 'components/_General/WarningCritical';
import CredentialsRow from './CredentialsRow';

type GeneratedCredentialProps = {
  forward: () => void;
  wifkey: string;
  seed: string;
};

const GeneratedCredentialRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  h2 {
    margin: 0;
    font-size: 15px;
    text-align: center;
  }
`;

const Confidential = styled.div`
  border-radius: var(--tg-radius);
  border: 1px solid var(--tg-separator);
  background: var(--tg-surface-2);
`;

const GeneratedCredential = ({ wifkey, seed, forward }: GeneratedCredentialProps) => {
  const t = useT();
  return (
    <GeneratedCredentialRoot>
      <h2>{t('create.backupTitle')}</h2>
      <Confidential>
        <CredentialsRow
          label={t('create.seed')}
          sublabel={t('create.seedHint')}
          credential={seed}
          tid="new-seed"
        />
        <CredentialsRow
          label={t('create.key')}
          sublabel={t('create.keyHint')}
          credential={wifkey}
          tid="new-wif"
        />
      </Confidential>
      <Warning
        title={t('create.warnTitle')}
        subtitle={[
          t('create.warnText'),
          <a href={links.security} key="securitylink" rel="noreferrer" target="_blank">
            {t('create.warnLink')}
          </a>,
        ]}
      />
      <Button onClick={forward} customWidth="100%" theme="purple" data-tid="create-next">
        {t('create.next')}
      </Button>
    </GeneratedCredentialRoot>
  );
};

export default GeneratedCredential;
