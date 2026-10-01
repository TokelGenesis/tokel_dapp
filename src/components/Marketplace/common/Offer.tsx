import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { selectTokenDetails } from 'store/selectors';
import links from 'util/links';
import { OrderDetailLite } from 'util/token-types';
import { TICKER } from 'vars/defines';

import { ButtonSmall } from 'components/_General/buttons';
import OpenInExplorer from 'components/_General/OpenInExplorer';
import { OrderRow, SideTag } from './ActiveOrderWidget';
import ViewContext, { MARKETPLACE_VIEWS } from './ViewContext';

const Bidder = styled.p`
  && {
    margin: 8px 0 12px;
    font-size: 12px;
    color: var(--tg-text-3);
    overflow-wrap: anywhere;
  }
  span {
    color: var(--tg-text-2);
    font-family: var(--tg-font-mono);
  }
`;

const OfferWidget = ({ order }: { order: OrderDetailLite }) => {
  const t = useT();
  const tokenDetails = useSelector(selectTokenDetails);
  const { setCurrentView, setCurrentOrderId } = React.useContext(ViewContext);
  const name = tokenDetails[order.tokenid]?.name;

  const handleReviewOffer = () => {
    setCurrentOrderId(order.txid);
    setCurrentView(MARKETPLACE_VIEWS.FILL);
  };

  return (
    <OrderRow data-tid="mk-offer">
      <div className="head">
        {/* filling someone's bid sells them your asset, so from your side it is a sale */}
        <SideTag side="sell">{t('mk.sideSell')}</SideTag>
        <span className={name ? 'name' : 'name loading'}>{name}</span>
        <OpenInExplorer
          inline
          width="14px"
          link={links.explorers[TICKER](`tokens/${order.tokenid}`)}
        />
      </div>
      <p className="math">
        {order.totalrequired === 1
          ? t('mk.bidForOne', { price: order.price, ticker: TICKER })
          : t('mk.bidFor', { n: order.totalrequired, price: order.price, ticker: TICKER })}
        {' · '}
        {t('mk.total', { total: order.bidamount, ticker: TICKER })}
      </p>
      <Bidder>
        {t('mk.bidBy')} <span>{order.origaddress}</span>
      </Bidder>
      <ButtonSmall theme="danger" data-tid="mk-offer-review" onClick={handleReviewOffer}>
        {t('mk.reviewOffer')}
      </ButtonSmall>
    </OrderRow>
  );
};

export default OfferWidget;
