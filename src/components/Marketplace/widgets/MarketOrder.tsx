import React from 'react';
import { useSelector } from 'react-redux';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Form, FormikProvider, useFormik } from 'formik';
import { toBitcoin } from 'satoshi-bitcoin';

import useDebounce from 'hooks/useDebounce';
import useMyTokens from 'hooks/useMyTokens';
import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectNotFound, selectOrderDetails, selectTokenDetails } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { parseBigNumObject } from 'util/helpers';
import useFulfillOrderSchema from 'util/validators/useMarketOrderSchema';
import { Colors, ModalName, TICKER } from 'vars/defines';

import Field from 'components/_General/_FormikElements/Field';
import Select from 'components/_General/_FormikElements/Select';
import { Box, CenteredButtonWrapper } from 'components/_General/_UIElements/common';
import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';
import AssetWidget from '../common/AssetWidget';
import ViewContext from '../common/ViewContext';

const Card = styled(Box)`
  height: auto;
  padding: 24px 28px 26px;
  h2 {
    margin: 0 0 4px;
    font-size: 18px;
  }
  .lead {
    margin: 0 0 18px;
    font-size: 13px;
    color: var(--tg-text-2);
  }
  .missing {
    margin: 8px 0 0;
    font-size: 12.5px;
    color: var(--tg-danger);
  }
`;

const initialValues = {
  orderId: '',
  assetId: '',
  quantity: 0,
  price: '',
};

interface MarketOrderWidgetProps {
  type: 'ask' | 'bid' | 'fill';
}

type MarketOrder = {
  assetId?: string;
  orderId?: string;
  quantity: number;
  price: string;
};

const MarketOrderWidget: React.FC<MarketOrderWidgetProps> = ({ type }) => {
  const orderDetails = useSelector(selectOrderDetails);
  const tokenDetails = useSelector(selectTokenDetails);
  const notFound = useSelector(selectNotFound);
  const t = useT();
  const myTokens = useMyTokens();
  const fulfillOrderSchema = useFulfillOrderSchema(type);
  const { currentOrderId: prefillOrderId } = React.useContext(ViewContext);

  const handleMarketOrder = (values: MarketOrder, { setSubmitting }) => {
    setSubmitting(false);
    dispatch.environment.SET_MODAL({
      name: ModalName.CONFIRM_MARKET_ORDER,
      options: { type, ...{ ...values, price: parseFloat(values.price) } },
    });
  };

  const formikBag = useFormik<Partial<MarketOrder>>({
    validationSchema: fulfillOrderSchema,
    initialValues,
    onSubmit: handleMarketOrder,
  });

  const debouncedOrderId = useDebounce(formikBag.values.orderId, 1000);
  const debouncedAssetId = useDebounce(formikBag.values.assetId, 1000);
  const currentOrderDetails = React.useMemo(
    () => orderDetails?.[formikBag.values.orderId] || orderDetails?.[formikBag.values.assetId],
    [orderDetails, formikBag.values.orderId, formikBag.values.assetId]
  );
  const currentTokenDetails =
    currentOrderDetails?.token || tokenDetails?.[formikBag.values.assetId];

  const lookupFailed =
    !currentOrderDetails &&
    !currentTokenDetails &&
    Boolean(notFound[type === 'fill' ? debouncedOrderId : debouncedAssetId]);

  const buttonTheme = React.useMemo(() => {
    if (type === 'bid' || (type === 'fill' && currentOrderDetails?.type === 'ask')) {
      return Colors.SUCCESS;
    }
    if (type === 'ask' || (type === 'fill' && currentOrderDetails?.type === 'bid')) {
      return Colors.DANGER;
    }
    return Colors.PURPLE;
  }, [type, currentOrderDetails]);

  const title = t(
    type === 'ask' ? 'mk.sellTitle' : type === 'bid' ? 'mk.bidTitle' : 'mk.fillTitle'
  );
  const subTitle = t(
    type === 'ask' ? 'mk.sellText' : type === 'bid' ? 'mk.bidText' : 'mk.fillText'
  );
  const buttonLabel = t(
    type === 'ask'
      ? 'mk.reviewSell'
      : type === 'bid'
      ? 'mk.reviewBid'
      : currentOrderDetails?.type === 'ask'
      ? 'mk.reviewBuy'
      : currentOrderDetails?.type === 'bid'
      ? 'mk.reviewSale'
      : 'mk.review'
  );

  React.useEffect(() => {
    if (prefillOrderId?.length)
      formikBag.setFieldValue(type === 'fill' ? 'orderId' : 'assetId', prefillOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillOrderId, formikBag.setFieldValue]);

  React.useEffect(() => {
    if (currentOrderDetails) {
      const quantity = parseBigNumObject(currentOrderDetails.bnAmount).toNumber();
      const price = toBitcoin(parseBigNumObject(currentOrderDetails.bnUnitPrice).toNumber());

      const values = {
        ...formikBag.values,
        ...{
          order: currentOrderDetails,
          orderId: currentOrderDetails?.orderid,
          assetId: currentOrderDetails?.token.tokenid,
          price: type === 'fill' ? `${price}` : undefined,
          quantity:
            type === 'fill' ? (currentOrderDetails?.token?.supply === 1 ? 1 : quantity) : undefined,
        },
      };

      formikBag.setFormikState({
        ...formikBag,
        values,
        touched: {
          orderId: true,
          assetId: true,
          price: type === 'fill',
          quantity: type === 'fill',
        },
      });

      formikBag.validateForm(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentOrderDetails,
    formikBag.setFieldValue,
    formikBag.validateForm,
    formikBag.setFormikState,
  ]);

  React.useEffect(() => {
    if (
      !currentOrderDetails &&
      currentTokenDetails?.supply === 1 &&
      formikBag.values.quantity !== 1
    ) {
      formikBag.setFieldValue('quantity', 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formikBag.setFieldValue,
    formikBag.values.quantity,
    currentTokenDetails,
    currentOrderDetails,
  ]);

  // an ID entered again gets a fresh lookup, even if it was not found before
  React.useEffect(() => {
    [debouncedOrderId, debouncedAssetId].forEach(id => {
      if (id && notFound[id]) dispatch.marketplace.CLEAR_NOT_FOUND(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOrderId, debouncedAssetId]);

  React.useEffect(() => {
    if (
      debouncedOrderId?.length === 64 &&
      !orderDetails?.[debouncedOrderId] &&
      !notFound[debouncedOrderId]
    ) {
      sendToBitgo(BitgoAction.ASSET_V2_FETCH_ORDER_DECODED, {
        orderId: debouncedOrderId,
      });
    }
  }, [debouncedOrderId, orderDetails, notFound]);

  React.useEffect(() => {
    if (
      debouncedAssetId?.length === 64 &&
      !tokenDetails?.[debouncedAssetId] &&
      !notFound[debouncedAssetId]
    ) {
      sendToBitgo(BitgoAction.TOKEN_V2_INFO_TOKEL, {
        tokenId: debouncedAssetId,
      });

      // User might be confusing order ID with asset ID. Query blockchain just in case
      if (type === 'bid') {
        sendToBitgo(BitgoAction.ASSET_V2_FETCH_ORDER_DECODED, {
          orderId: debouncedAssetId,
        });
      }
    }
  }, [debouncedAssetId, tokenDetails, type, notFound]);

  React.useEffect(() => {
    if (formikBag.values.orderId?.length !== 64) {
      formikBag.setFieldValue('order', {});
      formikBag.setFieldValue('quantity', 0);
      formikBag.setFieldValue('price', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikBag.setFieldValue, formikBag.values.orderId]);

  return (
    <Card data-tid={`mk-form-${type}`}>
      <h2>{title}</h2>
      <p className="lead">{subTitle}</p>
      <FormikProvider value={formikBag}>
        <Form>
          {type === 'fill' && (
            <Field
              name="orderId"
              type="textarea"
              placeholder={t('mk.orderIdPh')}
              label={t('mk.orderId')}
              help={t('mk.orderIdHelp')}
            />
          )}

          {type === 'ask' && (
            <Select
              name="assetId"
              type="textarea"
              label={t('mk.asset')}
              placeholder={t('mk.assetPh')}
              options={Object.values(myTokens)}
              help={t('mk.assetHelp')}
              useOptionValueAsFieldValue
            />
          )}

          {type === 'bid' && (
            <Field
              name="assetId"
              type="textarea"
              placeholder={t('mk.tokenIdPh')}
              label={t('mk.tokenId')}
              help={t('mk.tokenIdHelp')}
            />
          )}

          <Columns
            gapless
            css={css`
              margin-bottom: 0 !important;
            `}
          >
            <Column size={5}>
              <Field
                name="quantity"
                type="number"
                label={t('mk.qty')}
                readOnly={currentTokenDetails?.supply === 1}
                placeholder="100,000"
                min={1}
                help={t('mk.qtyHelp')}
              />
            </Column>
            <Column size={7}>
              <Field
                name="price"
                type="text"
                label={t('mk.price')}
                placeholder="0"
                help={t('mk.priceHelp')}
                disabled={type === 'fill'}
                appendLight
                append={TICKER}
              />
            </Column>
          </Columns>

          <AssetWidget asset={currentTokenDetails} />
          {lookupFailed && (
            <p className="missing" role="status" data-tid="mk-not-found">
              {t(type === 'fill' ? 'mk.orderMissing' : 'mk.tokenMissing')}
            </p>
          )}

          <CenteredButtonWrapper
            css={css`
              margin-top: 15px;
            `}
          >
            <Button
              data-tid="mk-review"
              theme={buttonTheme}
              disabled={!formikBag.isValid}
              loading={
                formikBag.isValidating ||
                (debouncedOrderId !== formikBag.values.orderId && !currentOrderDetails) ||
                (debouncedAssetId !== formikBag.values.assetId && !currentTokenDetails)
              }
            >
              {buttonLabel}
            </Button>
          </CenteredButtonWrapper>
        </Form>
      </FormikProvider>
    </Card>
  );
};

export default MarketOrderWidget;
