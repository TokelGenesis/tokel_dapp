import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { selectAllMyOffers, selectMyTokenDetails } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';

import Offer from 'components/Marketplace/common/Offer';
import OrderList from '../common/OrderList';

const Narrow = styled.div`
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
`;

const MyOffersWidget: React.FC = () => {
  const t = useT();
  const allMyOffers = useSelector(selectAllMyOffers);
  const myTokensDetails = useSelector(selectMyTokenDetails);

  React.useEffect(() => {
    Object.keys(myTokensDetails).forEach(tokenId => {
      sendToBitgo(BitgoAction.TOKEN_V2_ORDERS, { tokenId });
    });
    // We want to run this only on mount to prevent an infinite loop, so we use an empty array as a dependency
    // eslint-disable-next-line
  }, []);

  return (
    <Narrow>
      <OrderList title={t('mk.offersTitle')} empty={t('mk.noOffers')} tid="mk-offers">
        {allMyOffers?.map(offer => (
          <Offer order={offer} key={offer.txid} />
        ))}
      </OrderList>
    </Narrow>
  );
};

export default MyOffersWidget;
