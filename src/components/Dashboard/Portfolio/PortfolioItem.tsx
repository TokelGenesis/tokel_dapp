import React from 'react';

import styled from '@emotion/styled';

import tokelIcon from 'assets/logo.svg';
import pressable from 'util/pressable';
import { PORTFOLIO_ITEM_HEIGHT_PX } from 'vars/defines';

type PortfolioItemRootProps = { selected: boolean };

// a row in the asset list; the chosen one gets the accent tint, like a selected sidebar row
const PortfolioItemRoot = styled.div<PortfolioItemRootProps>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-height: ${PORTFOLIO_ITEM_HEIGHT_PX - 8}px;
  margin: 2px 8px;
  padding: 8px 10px;
  border-radius: var(--tg-radius);
  background-color: ${props => (props.selected ? 'var(--tg-accent-soft)' : 'transparent')};
  color: var(--tg-text);
  cursor: pointer;
  flex-direction: row;
  transition: background 0.12s ease;
  &:hover {
    background-color: ${props => (props.selected ? 'var(--tg-accent-soft)' : 'var(--tg-fill)')};
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  height: 36px;
  width: 36px;
  img {
    width: 36px;
    height: 36px;
  }
`;

const Information = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Price = styled.small`
  color: var(--tg-text-2);
  font-weight: 400;
`;

const Amount = styled.p`
  color: var(--tg-text-2);
  font-size: 12px;
  margin: 1px 0 0;
`;

const NFTBadge = styled.div`
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--tg-accent-soft);
  &:before {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--tg-accent-text);
    content: 'NFT';
  }
`;

type PortfolioItemProps = {
  name: string;
  price?: string;
  subtitle?: string;
  icon?: boolean;
  nft?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

const PortfolioItem = ({
  name,
  price,
  subtitle,
  icon,
  nft,
  selected,
  onClick,
}: PortfolioItemProps): React.ReactElement => {
  return (
    <PortfolioItemRoot
      selected={selected}
      aria-current={selected || undefined}
      {...pressable(onClick)}
    >
      {icon && (
        <IconWrapper>
          <img alt={`${name}-icon`} src={tokelIcon} />
        </IconWrapper>
      )}
      <Information>
        <Name>
          {name} <Price>{price}</Price>
        </Name>
        <Amount>{subtitle}</Amount>
      </Information>
      {nft && <NFTBadge />}
    </PortfolioItemRoot>
  );
};

export default PortfolioItem;
