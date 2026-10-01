import React from 'react';

import styled from '@emotion/styled';

import infoIcon from 'assets/friendlyWarning.svg';
import nftIcon from 'assets/Star.svg';
import tokenIcon from 'assets/Token-alt.svg';
import tokenMenuIcon from 'assets/Token.svg';
import { useT } from 'i18n';
import { Responsive } from 'util/helpers';
import TokenType from 'util/types/TokenType';

import { Box, Layout } from 'components/_General/_UIElements/common';
import Icon from 'components/_General/_UIElements/Icon';
import { Column } from 'components/_General/Grid';
import CreateTokenForm from './Form';

const HelperWidget = styled(Box)`
  height: auto;
  margin-bottom: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--tg-surface-2);
  img {
    width: 20px;
    height: 20px;
    margin-top: 2px;
  }
  h2 {
    margin: 0 0 4px;
    font-size: 14px;
  }
  p {
    margin: 0;
    font-size: 12.5px;
    color: var(--tg-text-2);
  }
`;

// the two kinds as selectable cards
const TokenTypeWidget = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  ${Responsive.below.L} {
    grid-template-columns: 1fr 1fr;
  }
`;

const TypeCard = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  text-align: left;
  border-radius: var(--tg-radius-l);
  border: 1px solid ${p => (p.selected ? 'var(--tg-accent)' : 'var(--tg-separator)')};
  background: ${p => (p.selected ? 'var(--tg-accent-soft)' : 'var(--tg-surface)')};
  box-shadow: ${p => (p.selected ? '0 0 0 3px var(--tg-focus)' : 'var(--tg-shadow-1)')};
  color: var(--tg-text);
  transition: background 0.15s ease, border-color 0.15s ease;
  &:hover {
    border-color: var(--tg-accent);
  }
  .ic {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: ${p => (p.selected ? 'var(--tg-accent)' : 'var(--tg-fill)')};
  }
  .ic div {
    background: ${p => (p.selected ? 'var(--tg-on-accent)' : 'var(--tg-text-2)')} !important;
  }
  b {
    font-size: 14px;
    font-weight: 600;
  }
`;

const FormBox = styled(Box)`
  padding: 20px;
  .no-state {
    text-align: center;
    max-width: 360px;
    h2 {
      margin: 12px 0 4px;
      font-size: 17px;
    }
    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
      color: var(--tg-text-2);
    }
    .icon {
      margin-left: auto;
      margin-right: auto;
    }
  }
`;

const CreateToken: React.FC = () => {
  const t = useT();
  const [typeSelected, setTypeSelected] = React.useState<TokenType | null>(null);

  const form =
    typeSelected === TokenType.NFT || typeSelected === TokenType.TOKEN ? (
      <CreateTokenForm tokenType={typeSelected} />
    ) : (
      <div className="no-state">
        <Icon icon={tokenMenuIcon} color="gradient" className="icon" height={40} width={40} />
        <h2>{t('tok.startTitle')}</h2>
        <h3>{t('tok.startText')}</h3>
      </div>
    );

  const [title, text] =
    typeSelected === TokenType.NFT
      ? [t('tok.aboutNft'), t('tok.aboutNftText')]
      : typeSelected === TokenType.TOKEN
      ? [t('tok.aboutToken'), t('tok.aboutTokenText')]
      : [t('tok.unsure'), t('tok.unsureText')];

  return (
    <Layout gapless>
      <Column size={4} vertical>
        <HelperWidget>
          <img alt="" src={infoIcon} />
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </HelperWidget>
        <TokenTypeWidget>
          {[
            { type: TokenType.NFT, label: t('tok.nft'), icon: nftIcon, tid: 'create-nft' },
            {
              type: TokenType.TOKEN,
              label: t('tok.fungible'),
              icon: tokenIcon,
              tid: 'create-token',
            },
          ].map(o => (
            <TypeCard
              key={o.type}
              type="button"
              selected={typeSelected === o.type}
              aria-pressed={typeSelected === o.type}
              data-tid={o.tid}
              onClick={() => setTypeSelected(o.type)}
            >
              <span className="ic">
                <Icon icon={o.icon} color="frontSoft" height={20} width={20} />
              </span>
              <b>{o.label}</b>
            </TypeCard>
          ))}
        </TokenTypeWidget>
      </Column>
      <Column>
        <FormBox flex={typeSelected === null}>{form}</FormBox>
      </Column>
    </Layout>
  );
};

export default CreateToken;
