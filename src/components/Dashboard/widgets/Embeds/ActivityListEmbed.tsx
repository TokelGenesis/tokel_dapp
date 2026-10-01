import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import bagIcon from 'assets/Bag.svg';
import checkIcon from 'assets/Check.svg';
import clockIcon from 'assets/Clock.svg';
import receiveIcon from 'assets/receiveIcon.svg';
import withdrawIcon from 'assets/withdrawIcon.svg';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectTokelPriceUSD } from 'store/selectors';
import { formatDate, getUsdValue, processPossibleBN, toBitcoinAmount } from 'util/helpers';
import { TxType } from 'util/nspvlib-mock';
import { Colors, ModalName, ResourceType, TICKER } from 'vars/defines';

import ExplorerLink from 'components/_General/ExplorerLink';
import InfoNote from 'components/_General/InfoNote';

const ActivityListRoot = styled.div`
  overflow-y: auto;
  padding: 4px 8px 8px;
`;

const ActivityListItem = styled.div`
  min-width: fit-content;
  width: 100%;
  display: flex;
  border-radius: var(--tg-radius-s);
  &:hover {
    background-color: var(--tg-fill);
  }
  & + & {
    border-top: 1px solid var(--tg-separator);
  }
`;

const Transaction = styled.div`
  display: grid;
  min-width: 400px;
  width: fill-available;
  grid-template-columns: 1.1fr 0.8fr 1fr 1.3fr 0.8fr;
  padding: 0 10px;
  cursor: pointer;
`;

const ExplorerLinkWrapper = styled.div`
  width: 60px;
  padding-right: 1rem;
  display: flex;
  align-items: center;
`;

const TriCellRoot = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 6px;
`;

const TriCellIcon = styled.img`
  margin-right: 10px;
`;

const TriCellInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Primary = styled.span`
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`;

const Secondary = styled.span`
  color: var(--tg-text-2);
  font-size: 12.5px;
`;

type TriCellProps = {
  icon?: string;
  primary?: string;
  secondary?: string;
  justify?: 'flex-start' | 'center' | 'flex-end';
  align?: 'flex-start' | 'center' | 'flex-end';
};

const TriCell = ({ icon, primary, secondary, justify, align }: TriCellProps) => (
  <TriCellRoot style={{ justifyContent: justify ?? 'flex-start' }}>
    {icon && <TriCellIcon width="20px" src={icon} alt={icon} />}
    <TriCellInfo style={{ alignItems: align ?? 'flex-start', justifyContent: 'center' }}>
      <Primary>{primary}</Primary>
      {secondary && <Secondary>{secondary}</Secondary>}
    </TriCellInfo>
  </TriCellRoot>
);

const handleTxDetailView = (tx: TxType) => {
  dispatch.account.SET_CHOSEN_TX(tx);
  dispatch.environment.SET_MODAL_NAME(ModalName.TX_DETAIL);
};

enum ActivityType {
  MINTED = 'mint',
  SENT = 'sent',
  RECEIVED = 'received',
}

const ActivityMap = {
  [ActivityType.MINTED]: {
    icon: bagIcon,
    primary: 'act.minted' as TKey,
    secondary: 'act.created' as TKey,
  },
  [ActivityType.SENT]: {
    icon: withdrawIcon,
    primary: 'act.sent' as TKey,
    secondary: 'act.withdrawal' as TKey,
  },
  [ActivityType.RECEIVED]: {
    icon: receiveIcon,
    primary: 'act.received' as TKey,
    secondary: 'act.deposit' as TKey,
  },
};

type ActivityListProps = {
  transactions: Array<TxType>;
  resourceType: ResourceType;
};

const ActivityList = ({
  transactions = [],
  resourceType,
}: ActivityListProps): React.ReactElement => {
  const t = useT();
  const tokelPriceUSD = useSelector(selectTokelPriceUSD);

  return (
    <ActivityListRoot>
      {transactions.length === 0 && <InfoNote title={t('dash.noActivity')} />}
      {transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(tx => {
          const times = tx.timestamp ? formatDate(tx.timestamp).split(' ') : ['N/A', ''];
          // eslint-disable-next-line no-nested-ternary
          const activityType = tx.from
            ? tx.received
              ? ActivityType.RECEIVED
              : ActivityType.SENT
            : ActivityType.MINTED;
          const activityData = ActivityMap[activityType];
          return (
            <ActivityListItem key={tx.txid}>
              <Transaction onClick={() => handleTxDetailView(tx)}>
                <TriCell icon={tx.unconfirmed ? clockIcon : checkIcon} primary={times[0]} />
                <TriCell secondary={times[1]} />

                <TriCell
                  icon={activityData.icon}
                  secondary={t(activityData.primary)}
                  align="center"
                />
                <TriCell
                  primary={` ${tx.received ? '+' : '-'}${toBitcoinAmount(
                    processPossibleBN(tx.value)
                  )} ${TICKER}`}
                  justify="flex-start"
                />
                <TriCell
                  secondary={
                    resourceType === ResourceType.TOKEL
                      ? `$${getUsdValue(processPossibleBN(tx.value), tokelPriceUSD)}`
                      : ''
                  }
                />
              </Transaction>
              <ExplorerLinkWrapper>
                <ExplorerLink display="none" txidColor={Colors.WHITE} txid={tx.txid} />
              </ExplorerLinkWrapper>
            </ActivityListItem>
          );
        })}
    </ActivityListRoot>
  );
};

export default ActivityList;
