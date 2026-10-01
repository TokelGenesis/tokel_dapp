import React from 'react';

import styled from '@emotion/styled';

import warning from 'assets/warningIcon.svg';

const WarningCriticalRoot = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  max-width: 520px;
  padding: 12px 14px;
  border-radius: var(--tg-radius);
  background: var(--tg-warning-soft);
  img {
    width: 20px;
    height: 20px;
    margin-top: 1px;
  }
  h3,
  p {
    margin: 0;
  }
  h3 {
    color: var(--tg-text);
    font-weight: 600;
    font-size: 13px;
  }
  p {
    color: var(--tg-text-2);
    font-size: 12.5px;
    margin-top: 2px;
  }
`;

type WarningCriticalProps = {
  title: string;
  subtitle: Array<string | React.ReactChild>;
};

const WarningCritical = ({ title, subtitle }: WarningCriticalProps) => {
  return (
    <WarningCriticalRoot>
      <img alt="warning" src={warning} />
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </WarningCriticalRoot>
  );
};

export default WarningCritical;
