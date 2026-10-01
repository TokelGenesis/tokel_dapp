import React from 'react';

import styled from '@emotion/styled';

type ErrorMessageProps = {
  children: JSX.Element | JSX.Element[] | string;
};

const StyledError = styled.div`
  min-height: 1rem;
  margin: 0.5rem 0;
  color: var(--tg-danger);
  font-size: 12.5px;
`;

const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return <StyledError>{children}</StyledError>;
};

export default ErrorMessage;
