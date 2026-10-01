import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectAccountWallets } from 'store/selectors';

import PasswordedAccountAccordion from './PasswordedAccountAccordion';

const PasswordLoginRoot = styled.div`
  width: 100%;
`;

const WalletBoxLabel = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: var(--tg-text-2);
  margin: 0 0 8px 4px;
`;

// a grouped list, as in macOS settings: one rounded box, rows split by hairlines
const AvailableWalletsBox = styled.div`
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius);
  background: var(--tg-surface);
  width: 100%;
  overflow: hidden;
  & [data-radix-collection-item]:first-of-type,
  & > div > div:first-of-type button {
    border-top: none;
  }
`;

const PasswordLogin = () => {
  const t = useT();
  const wallets = useSelector(selectAccountWallets);

  React.useEffect(() => {
    dispatch.account.loadWallets();
  }, []);

  return (
    <PasswordLoginRoot>
      <WalletBoxLabel>{t('pw.wallets')}</WalletBoxLabel>
      <AvailableWalletsBox>
        <PasswordedAccountAccordion wallets={wallets} />
      </AvailableWalletsBox>
    </PasswordLoginRoot>
  );
};

export default PasswordLogin;
