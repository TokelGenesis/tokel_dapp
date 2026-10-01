import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';
import QRCode from 'qrcode.react';

import { useT } from 'i18n';
import { selectAccountAddress, selectAccountPubKey, selectModalOptions } from 'store/selectors';
import { Colors, ResourceType, TICKER } from 'vars/defines';

import CopyToClipboard from 'components/_General/CopyToClipboard';
import WarningFriendly from 'components/_General/WarningFriendly';
import { VSpaceBig } from 'components/Dashboard/widgets/common';

const ReceiveRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const QRCodeWrapper = styled.div`
  background-color: #ffffff; /* a QR code needs a white background in every theme */
  padding: 12px;
  width: 168px;
  height: 168px;
  border-radius: var(--tg-radius);
  box-shadow: var(--tg-shadow-1);
`;
const AddressInput = styled.div`
  min-height: 40px;
  width: 400px;
  max-width: 100%;
  border: 1px solid var(--tg-separator);
  background: var(--tg-surface-2);
  border-radius: var(--tg-radius);
  display: flex;
  align-items: center;
  margin-bottom: 14px;
`;

const AddressWrapper = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0 12px;
  font-family: var(--tg-font-mono);
  font-size: 12.5px;
  overflow-wrap: anywhere;
  user-select: text;
`;

const Copy = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
`;

export type ReceiveModalOpts = {
  type: ResourceType;
};

const Receive = () => {
  const t = useT();
  const options = useSelector(selectModalOptions) as ReceiveModalOpts;
  const target = useSelector(
    options.type === ResourceType.TOKEL ? selectAccountAddress : selectAccountPubKey
  );

  return (
    <ReceiveRoot>
      <QRCodeWrapper>
        <QRCode value={target} />
      </QRCodeWrapper>
      <VSpaceBig />
      <AddressInput>
        <AddressWrapper>{target}</AddressWrapper>
        <Copy>
          <CopyToClipboard color={Colors.WHITE} textToCopy={target} />
        </Copy>
      </AddressInput>
      <WarningFriendly
        message={
          options.type === ResourceType.TOKEL
            ? t('recv.both', { ticker: TICKER })
            : t('recv.pubkey')
        }
      />
    </ReceiveRoot>
  );
};

export default Receive;
