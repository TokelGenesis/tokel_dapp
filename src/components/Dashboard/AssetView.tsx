import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import {
  selectLockedTransactions,
  selectLockedTransactionsBalance,
  selectTransactions,
  selectUnspentBalance,
} from 'store/selectors';
import { useT } from 'i18n';
import { processPossibleBN } from 'util/helpers';
import { LOCKED, ResourceType, SPENDABLE } from 'vars/defines';

import ActivityListEmbed from './widgets/Embeds/ActivityListEmbed';
import TransferEmbed, { HoldingType } from './widgets/Embeds/TransferEmbed';
import WalletAddressesEmbed from './widgets/Embeds/WalletAddressesEmbed';
import StandardWidget from './widgets/StandardWidget';

const AssetViewRoot = styled.div`
  flex: 1;
  height: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: minmax(250px, 1fr) minmax(220px, 1fr);
  grid-gap: 16px;
  overflow-y: auto;
`;

const AssetView = (): React.ReactElement => {
  const t = useT();
  const txs = useSelector(selectTransactions);
  const lockedTransactions = useSelector(selectLockedTransactions);
  const lockedSum = useSelector(selectLockedTransactionsBalance);
  const balance = processPossibleBN(useSelector(selectUnspentBalance));
  const holdings: Array<HoldingType> = [
    {
      label: SPENDABLE,
      value: `${Number(balance) - (Number(lockedSum) || 0)}`,
      icon: 'coinStack',
    },
  ];
  if (lockedTransactions?.length > 0) {
    holdings.push({
      label: LOCKED,
      value: lockedTransactions,
      icon: 'lock',
    });
  }

  return (
    <AssetViewRoot>
      <StandardWidget title={t('dash.send')} width={3} height={1}>
        <TransferEmbed holdingSections={holdings} />
      </StandardWidget>
      <StandardWidget title={t('dash.receive')} width={3} height={1}>
        <WalletAddressesEmbed />
      </StandardWidget>
      <StandardWidget title={t('dash.activity')} width={6} height={1}>
        <ActivityListEmbed transactions={txs} resourceType={ResourceType.TOKEL} />
      </StandardWidget>
    </AssetViewRoot>
  );
};
export default AssetView;
