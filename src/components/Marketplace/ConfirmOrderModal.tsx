import React from 'react';
import { useSelector } from 'react-redux';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectModalOptions, selectOrderDetails, selectTokenDetails } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { Colors, FEE, ModalName, TICKER } from 'vars/defines';

import { CenteredButtonWrapper } from 'components/_General/_UIElements/common';
import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';
import WarningCritical from 'components/_General/WarningCritical';
import AssetWidget from './common/AssetWidget';
import KeyValueDisplay from './common/KeyValueDisplay';

const WarningWrapper = styled.div`
  margin: 4px 0 18px;
  & > div {
    max-width: none;
  }
`;

const ConfirmOrderModal: React.FC = () => {
  const t = useT();
  const formValues = useSelector(selectModalOptions) as Record<string, unknown>;
  const orderDetails = useSelector(selectOrderDetails);
  const tokenDetails = useSelector(selectTokenDetails);

  const currentOrderDetails = orderDetails?.[formValues?.orderId as string];
  const currentOrderType = currentOrderDetails?.type;
  const currentTokenDetails =
    currentOrderDetails?.token || tokenDetails?.[formValues?.assetId as string];
  const isFilling = formValues?.type === 'fill';

  const handleOrderBroadcast = () => {
    if (formValues?.type === 'fill') {
      sendToBitgo(
        currentOrderType === 'bid' ? BitgoAction.ASSET_V2_FILL_BID : BitgoAction.ASSET_V2_FILL_ASK,
        {
          orderId: formValues?.orderId as string,
          tokenId: formValues.assetId as string,
          amount: formValues.quantity as number,
        }
      );
    } else {
      sendToBitgo(
        formValues?.type === 'bid' ? BitgoAction.ASSET_V2_POST_BID : BitgoAction.ASSET_V2_POST_ASK,
        {
          tokenId: formValues.assetId as string,
          amount: formValues.quantity as number,
          unitPrice: formValues.price as number,
        }
      );
    }

    dispatch.environment.SET_MODAL({
      name: ModalName.MARKET_ORDER_SENT,
      options: {
        isFilling,
        token: currentTokenDetails,
      },
    });
  };

  const orderSide = React.useMemo(
    () => (isFilling ? currentOrderType : formValues?.type),
    [formValues?.type, isFilling, currentOrderType]
  );

  const myOrderSide = React.useMemo(() => {
    if (formValues?.type === 'bid' || (isFilling && currentOrderType === 'ask')) {
      return 'bid';
    }
    return 'ask';
  }, [formValues?.type, isFilling, currentOrderType]);

  const calculatedCostOrProceeds = React.useMemo(() => {
    const total = (formValues.price as number) * (formValues.quantity as number);
    const royalty = currentTokenDetails?.dataAsJson?.royalty / 10 || 0;

    return myOrderSide === 'bid'
      ? (total + FEE).toFixed(8)
      : (total - (total * royalty) / 100 - FEE).toFixed(8);
  }, [formValues.price, formValues.quantity, myOrderSide, currentTokenDetails]);

  const buttonTheme = React.useMemo(
    () => (myOrderSide === 'bid' ? Colors.SUCCESS : Colors.DANGER),
    [myOrderSide]
  );

  const buttonLabel = t(
    formValues.type === 'ask'
      ? 'mk.postSell'
      : formValues.type === 'bid'
      ? 'mk.postBid'
      : currentOrderType === 'ask'
      ? 'mk.confirmBuy'
      : currentOrderType === 'bid'
      ? 'mk.confirmSale'
      : 'mk.confirm'
  );

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

      <Columns
        gapless
        multiline
        css={css`
          margin-bottom: 0 !important;
        `}
      >
        <Column size={3}>
          <KeyValueDisplay color={orderSide === 'bid' ? Colors.SUCCESS : Colors.DANGER}>
            <span>{t('mk.lblType')}</span>
            <p>{t(orderSide === 'bid' ? 'mk.typeBid' : 'mk.typeAsk')}</p>
          </KeyValueDisplay>
        </Column>

        {Boolean(formValues.orderId) && (
          <Column size={9}>
            <KeyValueDisplay>
              <span>{t('mk.orderId')}</span>
              <p>{formValues.orderId}</p>
            </KeyValueDisplay>
          </Column>
        )}

        <Column size={isFilling ? 4 : 3}>
          <KeyValueDisplay>
            <span>{t('mk.lblAmount')}</span>
            <p>{formValues.quantity}</p>
          </KeyValueDisplay>
        </Column>

        <Column size={isFilling ? 4 : 3}>
          <KeyValueDisplay>
            <span>{t('mk.lblUnit')}</span>
            <p>
              {formValues.price} {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>

        <Column size={isFilling ? 4 : 3}>
          <KeyValueDisplay>
            <span>{t('mk.lblTotal')}</span>
            <p>
              {(formValues.price as number) * (formValues.quantity as number)} {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>

        <Column size={4}>
          <KeyValueDisplay>
            <span>{t('mk.lblRoyalty')}</span>
            <p>
              {currentTokenDetails?.dataAsJson?.royalty / 10 || 0}% {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>

        <Column size={4}>
          <KeyValueDisplay>
            <span>{t('mk.lblFee')}</span>
            <p>
              {FEE} {TICKER}
            </p>
          </KeyValueDisplay>
        </Column>

        <Column size={4}>
          {myOrderSide === 'bid' && (
            <KeyValueDisplay color={Colors.DANGER}>
              <>
                <span>{t('mk.lblCost')}</span>
                <p>
                  {calculatedCostOrProceeds} {TICKER}
                </p>
              </>
            </KeyValueDisplay>
          )}

          {myOrderSide === 'ask' && (
            <KeyValueDisplay color={Colors.SUCCESS}>
              <>
                <span>{t('mk.lblProceeds')}</span>
                <p>
                  {calculatedCostOrProceeds} {TICKER}
                </p>
              </>
            </KeyValueDisplay>
          )}
        </Column>
      </Columns>

      {!isFilling && (
        <WarningWrapper>
          <WarningCritical title="" subtitle={[t('mk.feeNote')]} />
        </WarningWrapper>
      )}

      <CenteredButtonWrapper>
        <Button theme={buttonTheme} data-tid="mk-confirm" onClick={handleOrderBroadcast}>
          {buttonLabel}
        </Button>
      </CenteredButtonWrapper>
    </div>
  );
};

export default ConfirmOrderModal;
