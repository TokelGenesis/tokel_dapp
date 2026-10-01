import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectAccountAddress, selectAccountPubKey, selectCurrentTokenInfo } from 'store/selectors';
import { ModalName, ResourceType, TICKER } from 'vars/defines';

import CopyTextInput from 'components/_General/CopyTextInput';
import { ReceiveModalOpts } from 'components/Modal/content/Receive';
import { ColWrapper, EmbedContentContainer, RowWrapper } from '../common';

const WalletAddressesEmbedRoot = styled(EmbedContentContainer)`
  padding: 12px 20px 18px;
  gap: 10px;
  overflow-y: auto;
`;

const Note = styled.p`
  font-size: 12.5px;
  color: var(--tg-text-2);
  margin: 0 0 2px;
`;

type WalletAddressWidgetProps = {
  title: string;
  modal_type: string;
};

const openWalletModal = (options: ReceiveModalOpts) => () =>
  dispatch.environment.SET_MODAL({ name: ModalName.RECEIVE, options });

const DisplayWalletAddress = ({ title, modal_type }: WalletAddressWidgetProps) => {
  const tokenInfo = useSelector(selectCurrentTokenInfo);
  const isNFT = tokenInfo?.supply === 1;
  const target = useSelector(
    modal_type === 'acc_address' ? selectAccountAddress : selectAccountPubKey
  );

  return (
    <RowWrapper>
      <ColWrapper>
        <CopyTextInput
          textToCopy={target}
          label={title}
          onClick={openWalletModal({
            type:
              modal_type === 'pub_key'
                ? isNFT
                  ? ResourceType.NFT
                  : ResourceType.FST
                : ResourceType.TOKEL,
          })}
        />
      </ColWrapper>
    </RowWrapper>
  );
};

const WalletAddressesEmbed = () => {
  const t = useT();
  return (
    <WalletAddressesEmbedRoot>
      <Note>{t('dash.receiveText', { ticker: TICKER })}</Note>
      <DisplayWalletAddress title={t('dash.address')} modal_type="acc_address" />
      <DisplayWalletAddress title={t('dash.pubkey')} modal_type="pub_key" />
    </WalletAddressesEmbedRoot>
  );
};

export default WalletAddressesEmbed;
