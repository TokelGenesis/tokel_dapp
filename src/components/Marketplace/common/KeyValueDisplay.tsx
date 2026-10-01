import styled from '@emotion/styled';

import { V } from 'util/theming';

// A small label above a value, as in the order dialogs.
const KeyValueDisplay = styled.div<{ color?: string }>`
  margin-bottom: 14px;
  margin-right: 10px;

  & > span {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--tg-text-3);
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
    ${props => !!props.color && `color: ${V.color[props.color]}; font-weight: 600;`};
  }
`;

export default KeyValueDisplay;
