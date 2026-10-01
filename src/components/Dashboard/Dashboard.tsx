import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { selectAccountAddress, selectChosenToken } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';

import AssetView from './AssetView';
import Portfolio from './Portfolio/Portfolio';
import TokenView from './TokenView';

const DashboardRoot = styled.div`
  display: flex;
  gap: 18px;
  height: 100%;
  width: 100%;
  flex: 1;
  background-color: var(--tg-bg);
  padding: 18px 20px 20px;
  margin: 0;
`;

const TX_FETCH_INTERVAL_MS = 30 * 1000;

const Dashboard = (): React.ReactElement => {
  const address = useSelector(selectAccountAddress);
  const chosenToken = useSelector(selectChosenToken);

  React.useEffect(() => {
    const txInterval = setInterval(() => {
      if (!address) return;
      sendToBitgo(BitgoAction.LIST_UNSPENT, { address });
      sendToBitgo(BitgoAction.LIST_TRANSACTIONS, { address });
    }, TX_FETCH_INTERVAL_MS);
    return () => {
      clearInterval(txInterval);
    };
  }, [address]);

  return (
    <DashboardRoot>
      <Portfolio />
      {chosenToken ? <TokenView /> : <AssetView />}
    </DashboardRoot>
  );
};

export default Dashboard;
