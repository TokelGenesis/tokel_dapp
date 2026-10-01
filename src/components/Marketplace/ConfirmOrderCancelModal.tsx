import React from 'react';
import { useSelector } from 'react-redux';

import { css } from '@emotion/react';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectModalOptions, selectTokenDetails } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { OrderDetailLite } from 'util/token-types';
import { Colors, FEE, ModalName, TICKER } from 'vars/defines';

import { CenteredButtonWrapper } from 'components/_General/_UIElements/common';
import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';
import AssetWidget from './common/AssetWidget';
import KeyValueDisplay from './common/KeyValueDisplay';

const ConfirmOrderCancelModal: React.FC = () => {
  const t = useT();
  const { order } = useSelector(selectModalOptions) as { order: OrderDetailLite };
  const tokenDetails = useSelector(selectTokenDetails);
  const currentTokenDetails = tokenDetails[order.tokenid];

  const handleCancelOrder = () => {
    sendToBitgo(
      order.funcid === 's' ? BitgoAction.ASSET_V2_CANCEL_ASK : BitgoAction.ASSET_V2_CANCEL_BID,
      { tokenId: order.tokenid, orderId: order.txid }
    );

    dispatch.environment.SET_MODAL({
      name: ModalName.MARKET_ORDER_SENT,
      options: {
        isCancelling: true,
        token: currentTokenDetails,
      },
    });
  };

  return (
    <div
      css={css`
        max-width: 560px;
        margin: 0 auto;
      `}
    >
      <KeyValueDisplay>
        <span>{t('mk.lblAsset')}</span>
        <AssetWidget asset={currentTokenDetails} />
      </KeyValueDisplay>

      <Columns multiline>
        <Column size={12}>
          <KeyValueDisplay>
            <span>{t('mk.orderId')}</span>
            <p>{order.txid}</p>
          </KeyValueDisplay>
        </Column>

        <Column size={3}>
          <KeyValueDisplay color={order.funcid === 'b' ? Colors.SUCCESS : Colors.DANGER}>
            <span>{t('mk.lblType')}</span>
            <p>{t(order.funcid === 'b' ? 'mk.typeBid' : 'mk.typeAsk')}</p>
          </KeyValueDisplay>
        </Column>

        <Column size={3}>
          <KeyValueDisplay>
            <span>{t('mk.lblAmount')}</span>
            <p>{order.askamount || order.bidamount}</p>
          </KeyValueDisplay>
        </Column>
        <Column size={3}>
          <KeyValueDisplay>
            <span>{t('mk.lblUnit')}</span>
            <p>
              {order.price} {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>

        <Column size={3}>
          <KeyValueDisplay>
            <span>{t('mk.lblTotal')}</span>
            <p>
              {order.totalrequired} {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>
      </Columns>

      <CenteredButtonWrapper>
        <Button theme="purple" data-tid="mk-cancel-confirm" onClick={handleCancelOrder}>
          {t('mk.cancelBtn')}
        </Button>

        <small
          css={css`
            margin-top: 10px;
            text-align: center;
            color: var(--tg-text-2);
          `}
        >
          {t('mk.cancelFee', { fee: FEE, ticker: TICKER })}
        </small>
      </CenteredButtonWrapper>
    </div>
  );
};

export default ConfirmOrderCancelModal;
