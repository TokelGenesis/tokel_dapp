import React from 'react';

import styled from '@emotion/styled';

import { Box } from 'components/_General/_UIElements/common';

const Card = styled(Box)`
  height: auto;
  padding: 18px 18px 8px;
  h2 {
    margin: 0 0 12px;
    font-size: 15px;
  }
  .empty {
    margin: 0 0 12px;
    padding: 22px 0;
    text-align: center;
    font-size: 13px;
    color: var(--tg-text-3);
    border-radius: var(--tg-radius);
    background: var(--tg-fill);
  }
`;

// A titled card holding a list of orders, with a quiet note when the list is empty.
const OrderList: React.FC<{ title: string; empty: string; tid?: string }> = ({
  title,
  empty,
  tid,
  children,
}) => {
  const items = React.Children.toArray(children);
  return (
    <Card data-tid={tid}>
      <h2>{title}</h2>
      {items.length ? items : <p className="empty">{empty}</p>}
    </Card>
  );
};

export default OrderList;
