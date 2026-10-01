import { useSelector } from 'react-redux';

import BN from 'bn.js';
import * as yup from 'yup';

import {
  selectOrderDetails,
  selectTokenBalances,
  selectTokenDetails,
  selectUnspentBalance,
} from 'store/selectors';
import { useT } from 'i18n';
import { parseBigNumObject } from 'util/helpers';
import { FEE, TICKER } from 'vars/defines';

const useFulfillOrderSchema = (type: 'fill' | 'ask' | 'bid') => {
  const t = useT();
  const orderDetails = useSelector(selectOrderDetails);
  const balance = useSelector(selectUnspentBalance);
  const myTokensBalances = useSelector(selectTokenBalances);
  const tokenDetails = useSelector(selectTokenDetails);

  return yup.object().shape({
    order: yup.object().nullable(),
    assetId: yup
      .string()
      .length(64, t('val.tokenId'))
      .test('not-null-in-bid', t('val.tokenIdReq'), value =>
        type === 'bid' ? value?.length > 0 : true
      ),
    orderId: yup
      .string()
      .length(64, t('val.orderId'))
      .test('not-null-in-fill', t('val.orderIdReq'), value =>
        type === 'fill' ? value?.length > 0 : true
      )
      .test('token-is-present', t('val.tokenMissing'), value =>
        orderDetails[value]?.type === 'bid'
          ? myTokensBalances[orderDetails[value]?.token?.tokenid] !== undefined
          : true
      )
      // let user know that fillasks for tokens with > 50% royalty will faill
      .test('token-has-problematic-royalty', t('val.royalty'), value =>
        type === 'fill' && orderDetails[value]?.type === 'ask'
          ? !tokenDetails[orderDetails[value]?.token?.tokenid]?.dataAsJson?.royalty ||
            tokenDetails[orderDetails[value]?.token?.tokenid]?.dataAsJson?.royalty <= 500
          : true
      ),
    quantity: yup
      .number()
      .min(1, t('val.qtyMin'))
      .required(t('val.qtyReq'))
      .test('order-amount', t('val.qtyMax'), (value, context) =>
        type === 'fill'
          ? new BN(value).lte(parseBigNumObject(orderDetails[context.parent.orderId]?.bnAmount))
          : true
      )
      .test('enough-balance', t('val.qtyBalance'), (value, context) =>
        type === 'ask' || (type === 'fill' && orderDetails[context.parent.orderId]?.type === 'bid')
          ? new BN(value).lte(parseBigNumObject(myTokensBalances[context.parent.assetId]))
          : true
      )
      .test('max-supply', t('val.qtySupply'), (value, context) =>
        type === 'bid' ? value <= tokenDetails?.[context.parent.assetId]?.supply : true
      )
      .required(t('val.qtyReq')),
    price: yup
      .string()
      .test('postive', t('val.price'), value => parseFloat(value) > 0)
      .test('min-one-satoshi', t('val.priceMin'), value => parseFloat(value) > 0.00000001)
      .required(t('val.priceReq'))
      .test('needs-funds', t('val.funds', { ticker: TICKER }), (value, context) =>
        ((type === 'fill' && orderDetails[context.parent.orderId]?.type === 'ask') ||
          type === 'bid') &&
        context.parent.quantity > 0
          ? parseFloat(value) <= (balance - FEE) / context.parent.quantity
          : true
      ),
  });
};

export default useFulfillOrderSchema;
