import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';
import Fuse from 'fuse.js';

import { ReactComponent as SearchIcon } from 'assets/Search.svg';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import {
  selectChosenToken,
  selectMyTokenDetails,
  selectTokenFilterId,
  selectTokenSearchTerm,
} from 'store/selectors';
import { TokenDetail } from 'util/token-types';
import { ModalName, PORTFOLIO_ITEM_HEIGHT_PX, ResourceType, TokenFilter } from 'vars/defines';

import PortfolioItem from './PortfolioItem';

const FilterFunc = {
  [TokenFilter.ALL]: () => true,
  [TokenFilter.NFT]: (token: TokenDetail) => token.supply === 1,
  [TokenFilter.FIXED_SUPPLY]: (token: TokenDetail) => token.supply !== 1,
};

const TokensRoot = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: calc(100% - ${PORTFOLIO_ITEM_HEIGHT_PX}px);
`;

// a segmented control (All / NFTs / Fixed supply), as in macOS toolbars
const TokenTypeFilterBar = styled.div`
  display: flex;
  gap: 2px;
  margin: 8px 12px;
  padding: 2px;
  border-radius: 8px;
  background: var(--tg-fill);
`;

const TokenFilterItem = styled.button<{ active: boolean }>`
  flex: 1;
  height: 24px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  padding: 0 4px;
  color: ${({ active }) => (active ? 'var(--tg-text)' : 'var(--tg-text-2)')};
  background: ${({ active }) => (active ? 'var(--tg-surface)' : 'transparent')};
  box-shadow: ${({ active }) => (active ? 'var(--tg-shadow-1)' : 'none')};
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 6px;
`;

const TokenSearchBar = styled.div`
  padding: 10px 12px 12px;
  border-top: 1px solid var(--tg-separator);
`;

const TokenSearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--tg-fill);
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  &:focus-within {
    border-color: var(--tg-accent);
    box-shadow: 0 0 0 3px var(--tg-focus);
  }
`;

const TokenSearchInput = styled.input`
  flex-grow: 1;
  height: 30px;
  padding: 0 10px 0 0;
  font-size: 13px;
  background: none;
  color: var(--tg-text);
  border: none;
  &::placeholder {
    color: var(--tg-text-3);
  }
  &:focus {
    outline: none;
    border: none;
  }
`;

const SearchIconWrapper = styled.div`
  display: flex;
  padding: 0 8px 0 10px;
  align-items: center;
  justify-content: center;
  color: var(--tg-text-3);
  svg {
    width: 14px;
    height: 14px;
  }
  svg path {
    fill: currentColor;
  }
`;

const FILTER_LABELS: Record<string, TKey> = {
  [TokenFilter.ALL]: 'dash.filterAll',
  [TokenFilter.NFT]: 'dash.filterNft',
  [TokenFilter.FIXED_SUPPLY]: 'dash.filterFixed',
};

const fuseOptions = {
  keys: ['tokenid', 'name', 'description'],
};

const Tokens = () => {
  const t = useT();
  const chosenToken = useSelector(selectChosenToken);

  const tokenFilterId = useSelector(selectTokenFilterId);
  const tokenSearchTerm = useSelector(selectTokenSearchTerm);
  const tokenDetails = useSelector(selectMyTokenDetails);

  const filteredTokenDetails = React.useMemo(() => {
    let result = Object.values(tokenDetails ?? []);
    const filterFunc = FilterFunc[tokenFilterId];
    if (filterFunc) {
      result = result.filter(filterFunc);
    }
    if (tokenSearchTerm === '' || !result.length) {
      return result;
    }
    const fuse = new Fuse(result, fuseOptions);
    return fuse.search(tokenSearchTerm).map(res => res.item);
  }, [tokenFilterId, tokenSearchTerm, tokenDetails]);

  return (
    <TokensRoot>
      <TokenTypeFilterBar>
        {Object.values(TokenFilter).map(filterId => (
          <TokenFilterItem
            type="button"
            key={filterId}
            onClick={() => dispatch.wallet.SET_TOKEN_FILTER_ID(filterId)}
            active={filterId === tokenFilterId}
            aria-pressed={filterId === tokenFilterId}
          >
            {t(FILTER_LABELS[filterId])}
          </TokenFilterItem>
        ))}
      </TokenTypeFilterBar>
      <TokenList>
        {filteredTokenDetails.length ? (
          filteredTokenDetails.map(token => (
            <PortfolioItem
              key={token.tokenid}
              name={`${token.name}`}
              nft={token.supply === 1}
              selected={token.tokenid === chosenToken}
              onClick={() => dispatch.wallet.SET_CHOSEN_TOKEN(token.tokenid)}
            />
          ))
        ) : (
          <PortfolioItem
            name={t('dash.noTokens')}
            subtitle={t('dash.noTokensHint')}
            onClick={() =>
              dispatch.environment.SET_MODAL({
                name: ModalName.RECEIVE,
                options: { type: ResourceType.NFT },
              })
            }
          />
        )}
      </TokenList>
      <TokenSearchBar>
        <TokenSearchInputContainer>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <TokenSearchInput
            onChange={e => dispatch.wallet.SET_TOKEN_SEARCH_TERM(e.currentTarget.value)}
            placeholder={t('dash.search')}
            aria-label={t('dash.search')}
          />
        </TokenSearchInputContainer>
      </TokenSearchBar>
    </TokensRoot>
  );
};

export default Tokens;
