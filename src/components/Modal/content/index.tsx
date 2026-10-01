import type { TKey } from 'i18n';
import React from 'react';

import { ModalName } from 'vars/defines';

import ConfirmTokenCreationModal from 'components/CreateToken/ConfirmTokenCreationModal';
import TokenCreatedTx from 'components/CreateToken/TokenCreatedTx';
import ConfirmOrderCancelModal from 'components/Marketplace/ConfirmOrderCancelModal';
import ConfirmOrderModal from 'components/Marketplace/ConfirmOrderModal';
import OrderCreatedTx from 'components/Marketplace/OrderCreatedTx';
import Feedback from './Feedback';
import IpfsExplainer from './IpfsExplainer';
import Receive from './Receive';
import Send from './Send';
import TxDetail from './TxDetail';

interface ModalPayloadType {
  title: TKey;
  component: React.ReactElement;
  size?: 'small' | 'medium' | 'large';
}

interface ModalCollectionType {
  [key: string]: ModalPayloadType;
}

export default {
  [ModalName.RECEIVE]: { title: 'mt.receive', component: <Receive /> },
  [ModalName.SEND]: { title: 'mt.send', component: <Send /> },
  [ModalName.FEEDBACK]: { title: 'mt.feedback', component: <Feedback /> },
  [ModalName.TX_DETAIL]: { title: 'mt.tx', component: <TxDetail /> },
  [ModalName.CONFIRM_TOKEN_CREATION]: {
    title: 'mt.confirmToken',
    component: <ConfirmTokenCreationModal />,
    size: 'large',
  },
  [ModalName.TOKEN_CREATED]: {
    title: 'mt.tx',
    component: <TokenCreatedTx />,
  },
  [ModalName.IPFS_EXPLAINER]: {
    title: 'mt.ipfs',
    component: <IpfsExplainer />,
  },
  [ModalName.CONFIRM_MARKET_ORDER]: {
    title: 'mt.confirmOrder',
    component: <ConfirmOrderModal />,
    size: 'medium',
  },
  [ModalName.MARKET_ORDER_SENT]: {
    title: 'mt.orderSent',
    component: <OrderCreatedTx />,
  },
  [ModalName.CONFIRM_CANCEL_MARKET_ORDER]: {
    title: 'mt.cancelOrder',
    size: 'medium',
    component: <ConfirmOrderCancelModal />,
  },
} as ModalCollectionType;
