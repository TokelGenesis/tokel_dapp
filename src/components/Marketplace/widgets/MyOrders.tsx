import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { selectMyOrders, selectTokenDetails } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { Responsive } from 'util/helpers';

import ActiveOrderWidget from 'components/Marketplace/common/ActiveOrderWidget';
import OrderList from '../common/OrderList';

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  ${Responsive.below.L} {
    grid-template-columns: 1fr;
  }
`;

const MyOrdersWidget: React.FC = () => {
  const t = useT();
  const myOrders = useSelector(selectMyOrders);
  const tokenDetails = useSelector(selectTokenDetails);

  const myAsks = React.useMemo(() => myOrders?.filter(order => order.funcid === 's'), [myOrders]);
  const myBids = React.useMemo(() => myOrders?.filter(order => order.funcid === 'b'), [myOrders]);

  React.useEffect(() => {
    myOrders.forEach(order => {
      if (!tokenDetails[order.tokenid])
        sendToBitgo(BitgoAction.TOKEN_V2_INFO_TOKEL, { tokenId: order.tokenid });
    });
  }, [myOrders, tokenDetails]);

  React.useEffect(() => {
    sendToBitgo(BitgoAction.ASSET_V2_MY_ORDERS);
  }, []);

  return (
    <Grid>
      <OrderList title={t('mk.mySells')} empty={t('mk.none')} tid="mk-my-sells">
        {myAsks?.map(ask => (
          <ActiveOrderWidget order={ask} key={ask.txid} />
        ))}
      </OrderList>
      <OrderList title={t('mk.myBids')} empty={t('mk.none')} tid="mk-my-bids">
        {myBids?.map(bid => (
          <ActiveOrderWidget order={bid} key={bid.txid} />
        ))}
      </OrderList>
    </Grid>
  );
};

export default MyOrdersWidget;
