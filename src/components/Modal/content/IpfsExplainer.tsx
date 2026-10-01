import React from 'react';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { DEFAULT_NULL_MODAL } from 'store/models/environment';
import { dispatch } from 'store/rematch';
import { V } from 'util/theming';
import { Colors, HIDE_IPFS_EXPLAINER_KEY } from 'vars/defines';

import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';

const Header = styled.h1`
  color: ${V.color.cornflower};

  &:first-of-type {
    margin-top: 0;
  }
`;

const LinkExample = styled.span`
  background-color: ${V.color.lilac};
  font-family: monospace;
  padding: 6px;
  border-radius: 4px;
`;

const handleCloseModal = () => dispatch.environment.SET_MODAL(DEFAULT_NULL_MODAL);

const handleDoNotRemindMe = () => {
  handleCloseModal();
  localStorage.setItem(HIDE_IPFS_EXPLAINER_KEY, 'true');
};

const IpfsExplainer: React.FC = () => {
  const t = useT();
  return (
    <div>
      <Header>{t('ipfs.warn')}</Header>
      <p>{t('ipfs.p1')}</p>
      <p>{t('ipfs.p2')}</p>
      <Header>{t('ipfs.todo')}</Header>
      <p>{t('ipfs.p3')}</p>
      <p>
        <LinkExample>ipfs://[file hash]</LinkExample>
      </p>
      <p>{t('ipfs.p4')}</p>
      <p>
        {t('ipfs.p5')}
        <a target="_blank" rel="noreferrer" href="https://docs.ipfs.io/concepts/what-is-ipfs">
          {t('ipfs.docs')}
        </a>
        .
      </p>

      <Columns>
        <Column>
          <Button
            theme={Colors.BLACK}
            customWidth="180px"
            data-tid="ipfs-never"
            onClick={handleDoNotRemindMe}
          >
            {t('ipfs.never')}
          </Button>
        </Column>
        <Column>
          <Button theme="purple" customWidth="180px" data-tid="ipfs-ok" onClick={handleCloseModal}>
            {t('ipfs.ok')}
          </Button>
        </Column>
      </Columns>
    </div>
  );
};

export default IpfsExplainer;
