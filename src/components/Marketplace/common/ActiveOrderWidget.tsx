import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';
import Tippy from '@tippyjs/react';

import InfoIcon from 'assets/HelperInfoCircle.svg';
import times from 'assets/times.svg';
import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectTokenDetails } from 'store/selectors';
import links from 'util/links';
import { OrderDetailLite } from 'util/token-types';
import { ModalName, TICKER } from 'vars/defines';

import Icon from 'components/_General/_UIElements/Icon';
import ExplorerLink from 'components/_General/ExplorerLink';
import OpenInExplorer from 'components/_General/OpenInExplorer';

export const OrderRow = styled.div`
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: var(--tg-radius);
  background: var(--tg-surface-2);
  border: 1px solid var(--tg-separator);
  p {
    margin: 0;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name.loading {
    width: 140px;
    height: 16px;
    border-radius: var(--tg-radius-s);
    background: var(--tg-fill);
  }
  .math {
    margin-top: 4px;
    font-size: 13px;
    color: var(--tg-text-2);
    font-variant-numeric: tabular-nums;
  }
`;

export const SideTag = styled.span<{ side: 'sell' | 'buy' }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${p => (p.side === 'sell' ? 'var(--tg-danger)' : 'var(--tg-success)')};
  background: ${p => (p.side === 'sell' ? 'var(--tg-danger-soft)' : 'var(--tg-success-soft)')};
`;

const CancelButton = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  &:hover {
    background: var(--tg-danger-soft);
  }
`;

const IdLabel = styled.span`
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--tg-text-3);
`;

const ActiveOrderWidget = ({ order }: { order: OrderDetailLite }) => {
  const t = useT();
  const tokenDetails = useSelector(selectTokenDetails);
  const name = tokenDetails[order.tokenid]?.name;
  const isSell = order.funcid === 's';

  const handleCancelOrder = () => {
    dispatch.environment.SET_MODAL({
      name: ModalName.CONFIRM_CANCEL_MARKET_ORDER,
      options: { order },
    });
  };

  return (
    <OrderRow data-tid="mk-order">
      <div className="head">
        <SideTag side={isSell ? 'sell' : 'buy'}>{t(isSell ? 'mk.sideSell' : 'mk.sideBuy')}</SideTag>
        <span className={name ? 'name' : 'name loading'}>{name}</span>
        <OpenInExplorer
          inline
          width="14px"
          link={links.explorers[TICKER](`tokens/${order.tokenid}`)}
        />
        <CancelButton
          type="button"
          aria-label={t('mk.cancel')}
          title={t('mk.cancel')}
          data-tid="mk-order-cancel"
          onClick={handleCancelOrder}
        >
          <Icon icon={times} color="front" width={12} height={12} />
        </CancelButton>
      </div>
      <p className="math">
        {isSell
          ? t('mk.units', {
              n: order.askamount,
              price: order.price,
              total: order.totalrequired,
              ticker: TICKER,
            })
          : t('mk.units', {
              n: order.totalrequired,
              price: order.price,
              total: order.bidamount,
              ticker: TICKER,
            })}
      </p>
      <IdLabel>
        {t('mk.orderId')}
        <Tippy content={t('mk.orderIdTip')} arrow>
          <Icon icon={InfoIcon} color="gradient" width={12} height={12} />
        </Tippy>
      </IdLabel>
      <ExplorerLink txid={order.txid} noLink />
    </OrderRow>
  );
};

export default ActiveOrderWidget;
