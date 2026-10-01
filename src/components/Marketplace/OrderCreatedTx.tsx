import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { DEFAULT_NULL_MODAL } from 'store/models/environment';
import { dispatch } from 'store/rematch';
import {
  selectCurrentTxError,
  selectCurrentTxId,
  selectCurrentTxStatus,
  selectModalOptions,
} from 'store/selectors';
import { V } from 'util/theming';
import { TokenDetail } from 'util/token-types';

import { Button } from 'components/_General/buttons';
import ExplorerLink from 'components/_General/ExplorerLink';
import Loader from 'components/_General/Spinner';
import AssetWidget from './common/AssetWidget';

const Title = styled.h2<{ success: boolean }>`
  color: ${props => (props.success ? V.color.growth : V.color.danger)};
  margin-top: 0;
`;

const closeModal = () => dispatch.environment.SET_MODAL(DEFAULT_NULL_MODAL);

const OrderCreatedTx: React.FC = () => {
  const t = useT();
  const { isFilling, isCancelling, token } = useSelector(selectModalOptions) as {
    isFilling?: boolean;
    isCancelling?: boolean;
    token: TokenDetail;
  };
  const error = useSelector(selectCurrentTxError);
  const txStatus = useSelector(selectCurrentTxStatus);
  const txId = useSelector(selectCurrentTxId);

  const [isBroadcasting, setIsBroadcasting] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsBroadcasting(txStatus === 0);
    setHasError(txStatus < 0);
  }, [txStatus]);

  React.useEffect(() => {
    return () => {
      dispatch.currentTransaction.RESET_TX();
    };
  }, []);

  if (isBroadcasting) {
    return (
      <div css={{ textAlign: 'center' }}>
        <Loader bgColor={V.color.modal.bg} />
        <p>{t('mk.sending')}</p>
      </div>
    );
  }

  return (
    <div>
      <Title success={!hasError}>
        {t(hasError ? 'mk.failed' : isCancelling ? 'mk.cancelSent' : 'mk.sent')}
      </Title>

      <AssetWidget asset={token} />

      {hasError ? (
        <>
          <p>{t('mk.errText', { error: String(error) })}</p>
          <p>{t('mk.errCheck')}</p>
        </>
      ) : (
        <p>
          {t('mk.sentText')}{' '}
          {t(isCancelling ? 'mk.sentCancel' : isFilling ? 'mk.sentFill' : 'mk.sentPost')}
        </p>
      )}

      {Boolean(txId) && (
        <div css={{ marginBottom: '20px' }}>
          <ExplorerLink type="tx" txid={txId} />
        </div>
      )}

      <Button
        type="button"
        theme={hasError ? 'danger' : 'success'}
        data-tid="mk-sent-close"
        onClick={closeModal}
      >
        {t(hasError ? 'mk.back' : 'mk.close')}
      </Button>
    </div>
  );
};

export default OrderCreatedTx;
