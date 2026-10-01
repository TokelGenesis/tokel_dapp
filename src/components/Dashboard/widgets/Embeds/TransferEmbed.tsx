import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectCurrentTokenBalance, selectCurrentTokenInfo } from 'store/selectors';
import { processPossibleBN } from 'util/helpers';
import icons from 'util/icons';
import { Colors, LOCKED, ModalName, ResourceType, SPENDABLE, TICKER } from 'vars/defines';

import { Button } from 'components/_General/buttons';
import { EmbedContentContainer } from '../common';

const Holdings = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 20px 18px;
  overflow-y: auto;
`;

const HoldingSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const HoldingSectionRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: flex-start;
  margin-top: 14px;
  img {
    width: 32px;
    height: 32px;
  }
`;

const HoldingSectionLabel = styled.h3`
  margin: 6px 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--tg-text-2);
`;

const HoldingSectionLabelCoin = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--tg-text-2);
  margin: 0 0 2px;
`;

const HoldingSectionTimelock = styled.p`
  font-size: 12px;
  margin: 0;
  color: var(--tg-text-3);
`;

const HoldingSectionValueCoin = styled.h3`
  margin: 0;
  font-family: var(--tg-font-display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
`;

const HoldingSectionValue = styled.span`
  font-family: var(--tg-font-display);
  font-size: 26px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const HoldingsNFTMessage = styled.span`
  margin-top: 12px;
  align-self: flex-start;
  background-color: var(--tg-accent-soft);
  color: var(--tg-accent-text);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
`;

const MarginedButton = styled(Button)`
  margin-top: 18px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Note = styled.p`
  font-size: 12.5px;
  color: var(--tg-text-2);
  margin: 0;
`;

const LABELS: Record<string, TKey> = {
  [SPENDABLE]: 'dash.spendable',
  [LOCKED]: 'dash.locked',
  holdings: 'dash.holdings',
};

const openSendModal = options => () =>
  dispatch.environment.SET_MODAL({ name: ModalName.SEND, options });

export type HoldingType = {
  label: string;
  value: string;
  icon: string;
};

type TransferEmbedProps = {
  holdingSections?: Array<HoldingType>;
};

const renderValue = one => (
  <HoldingSectionValueCoin key={one.lockTime}>
    {`${processPossibleBN(one.value)} ${TICKER}`}
    {one.lockTime && <HoldingSectionTimelock>until {one.lockTime}</HoldingSectionTimelock>}
  </HoldingSectionValueCoin>
);

const TransferEmbed = ({ holdingSections }: TransferEmbedProps) => {
  const t = useT();
  const label = (l: string) => (LABELS[l] ? t(LABELS[l]) : l);
  const tokenInfo = useSelector(selectCurrentTokenInfo);
  const currentBalance = useSelector(selectCurrentTokenBalance);
  const isNFT = tokenInfo && tokenInfo.supply === 1;
  const isToken = tokenInfo && tokenInfo.supply;
  const sections = holdingSections ?? [{ label: 'holdings', value: currentBalance }];

  return (
    <EmbedContentContainer>
      <Holdings>
        {!isToken && <Note>{t('dash.holdings')}</Note>}
        {isToken ? (
          <>
            {isNFT ? (
              <HoldingsNFTMessage>{t('dash.nft')}</HoldingsNFTMessage>
            ) : (
              sections.map(section => (
                <HoldingSection key={section.label}>
                  <HoldingSectionLabel>{label(section.label)}</HoldingSectionLabel>
                  <HoldingSectionValue>{processPossibleBN(section.value)}</HoldingSectionValue>
                </HoldingSection>
              ))
            )}
            <Buttons>
              <MarginedButton
                onClick={openSendModal({
                  // eslint-disable-next-line no-nested-ternary
                  type: isNFT ? ResourceType.NFT : ResourceType.FST,
                })}
                theme={Colors.PURPLE}
                customWidth="140px"
                data-tid="send-token"
              >
                {t('dash.send')}
              </MarginedButton>
            </Buttons>
          </>
        ) : (
          sections.map(section => (
            <HoldingSectionRow key={section.label}>
              <img src={icons[section.icon]} alt="" />
              <HoldingSection style={{ flex: 1, minWidth: 0 }}>
                <HoldingSectionLabelCoin>{label(section.label)}</HoldingSectionLabelCoin>
                {Array.isArray(section.value)
                  ? section.value.map(one => renderValue(one))
                  : renderValue(section)}
              </HoldingSection>
              {section.label === SPENDABLE && (
                <Button
                  onClick={openSendModal({ type: ResourceType.TOKEL })}
                  theme={Colors.PURPLE}
                  customWidth="120px"
                  data-tid="send-tkl"
                >
                  {t('dash.send')}
                </Button>
              )}
            </HoldingSectionRow>
          ))
        )}
      </Holdings>
    </EmbedContentContainer>
  );
};

export default TransferEmbed;
