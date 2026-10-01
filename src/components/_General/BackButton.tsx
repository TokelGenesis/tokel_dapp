import React from 'react';

import styled from '@emotion/styled';

import arrowBack from 'assets/arrowBack.svg';

const BackButtonRoot = styled.button`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: var(--tg-fill);
  border: none;
  border-radius: 50%;
  img {
    opacity: 0.75;
  }
  body[data-theme='light'] & img {
    filter: invert(1);
  }
  &:hover {
    background: var(--tg-fill-hover);
  }
`;

type BackButtonProps = {
  onClick: () => void;
  label?: string;
};

const BackButton = ({ onClick, label = 'Back' }: BackButtonProps) => (
  <BackButtonRoot type="button" onClick={onClick} aria-label={label} title={label} data-tid="back">
    <img alt="" src={arrowBack} />
  </BackButtonRoot>
);

export default BackButton;
