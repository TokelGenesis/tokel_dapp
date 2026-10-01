import styled from '@emotion/styled';

import { Responsive } from 'util/helpers';

import { Column, Columns } from 'components/_General/Grid';

// dashboard root in dashboard.tsx
const Layout = styled(Columns)`
  background-color: var(--tg-bg);
  padding: 18px 20px 20px;
  overflow-x: hidden;

  ${Column}:last-child {
    ${Responsive.above.L} {
      padding-left: 16px;
    }

    ${Responsive.below.L} {
      padding-top: 16px;
    }
  }
`;

// widgetcontainer in dashboard/common.tsx
const Box = styled.div<{ flex?: boolean }>`
  background-color: var(--tg-surface);
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius-l);
  box-shadow: var(--tg-shadow-1);

  ${props =>
    props.flex &&
    `
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
  `}

  height: 100%;
  padding: 20px;
`;

const CenteredButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  & > * {
    margin-left: auto;
    margin-right: auto;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  margin-top: 0;
`;

const SubTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--tg-text-2);
`;

export { Layout, Box, CenteredButtonWrapper, Title, SubTitle };
