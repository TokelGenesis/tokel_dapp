import React from 'react';

import styled from '@emotion/styled';

import links from 'util/links';
import { TokenDetail } from 'util/token-types';
import { TICKER } from 'vars/defines';

import OpenInExplorer from 'components/_General/OpenInExplorer';

const Wrapper = styled.div<{ isPlaceholder?: boolean }>`
  background: var(--tg-surface-2);
  border: 1px solid var(--tg-separator);
  padding: 12px 14px;
  border-radius: var(--tg-radius);

  display: flex;

  & > span {
    height: 40px;
    width: 40px;
    ${props =>
      props.isPlaceholder && `background-color: var(--tg-fill); border-radius: var(--tg-radius-s);`}
  }

  & > div {
    margin-left: 6px;
    display: flex;
    flex-direction: column;

    &:first-of-type {
      width: 70%;
    }

    ${props =>
      !props.isPlaceholder &&
      `
      &:last-child {
        margin-top: auto;
        margin-bottom: auto;
        margin-left: auto;
        margin-right: 16px;
      }
    `}

    span {
      ${props =>
        props.isPlaceholder &&
        `background-color: var(--tg-fill); border-radius: var(--tg-radius-s);`}

      h1,
      h2 {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }
      h1 {
        text-align: left;
        font-size: 15px;
        font-weight: 600;
      }

      h2 {
        font-size: 13px;
        font-weight: 400;
        color: var(--tg-text-2);
      }
    }

    span:first-child {
      height: 14px;
      min-width: 120px;
      margin-bottom: 4px;
    }

    span:last-child {
      height: 22px;
      min-width: 160px;
    }
  }
`;

interface AssetWidgetProps {
  asset?: TokenDetail;
}

const AssetWidget: React.FC<AssetWidgetProps> = ({ asset }) => {
  if (!asset)
    return (
      <Wrapper isPlaceholder data-tid="mk-asset-empty">
        <span />
        <div>
          <span />
          <span />
        </div>
      </Wrapper>
    );

  const link = links.explorers[TICKER](`tokens/${asset.tokenid}/transactions`);

  return (
    <>
      <Wrapper data-tid="mk-asset">
        <div>
          <span>
            <h1>{asset.name}</h1>
          </span>
          <span>
            <h2>{asset.description}</h2>
          </span>
        </div>
        <div>
          <OpenInExplorer width="18px" link={link} />
        </div>
      </Wrapper>
    </>
  );
};

export default AssetWidget;
