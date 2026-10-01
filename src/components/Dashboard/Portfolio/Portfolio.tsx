import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import {
  selectChosenToken,
  selectCurrentAsset,
  selectTokelPriceUSD,
  selectTokenCount,
  selectUnspentBalance,
} from 'store/selectors';

import { WidgetContainer } from '../widgets/common';
import PortfolioItem from './PortfolioItem';
import Tokens from './Tokens';

const PortfolioRoot = styled(WidgetContainer)`
  height: 100%;
  width: 280px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 6px 0 0;
  color: var(--tg-text);
  overflow: hidden;
`;

const Portfolio = (): React.ReactElement => {
  const t = useT();
  const currentAsset = useSelector(selectCurrentAsset);
  const balance = useSelector(selectUnspentBalance);
  const chosenToken = useSelector(selectChosenToken);
  const tokenCount = useSelector(selectTokenCount);

  const tokelPriceUSD = useSelector(selectTokelPriceUSD);
  const priceString = tokelPriceUSD ? ` ~ $${Math.round(balance * tokelPriceUSD * 100) / 100}` : '';

  return (
    <PortfolioRoot>
      {currentAsset && (
        <PortfolioItem
          key={currentAsset.name}
          name={`${balance} ${currentAsset.ticker}`}
          price={`${priceString}`}
          subtitle={tokenCount === 1 ? t('dash.token1') : t('dash.tokens', { n: tokenCount })}
          selected={!chosenToken}
          onClick={() => dispatch.wallet.SET_CHOSEN_TOKEN(null)}
          icon
        />
      )}
      <Tokens />
    </PortfolioRoot>
  );
};

export default Portfolio;
