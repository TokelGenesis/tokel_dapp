import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectNspvStatus } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';

const NspvIndicatorRoot = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--tg-radius-s);
  &:hover {
    background: var(--tg-fill);
  }
`;

type StatusIconProps = {
  nspvStatus: number;
};

const StatusIcon = styled.span<StatusIconProps>`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: ${p =>
    p.nspvStatus === 1
      ? 'var(--tg-success)'
      : p.nspvStatus === 2
      ? 'var(--tg-warning)'
      : 'var(--tg-danger)'};
  box-shadow: 0 0 0 3px
    ${p =>
      p.nspvStatus === 1
        ? 'var(--tg-success-soft)'
        : p.nspvStatus === 2
        ? 'var(--tg-warning-soft)'
        : 'var(--tg-danger-soft)'};
`;

const StatusText = styled.span`
  font-size: 12px;
  color: var(--tg-text-2);
`;

const NspvIndicator = () => {
  const t = useT();
  const nspvStatus = useSelector(selectNspvStatus);
  const [nspvLocalStatus, setNspvLocalStatus] = React.useState(1);

  React.useEffect(() => {
    setNspvLocalStatus(Number(nspvStatus));
  }, [nspvStatus]);

  return (
    <NspvIndicatorRoot
      type="button"
      title={t('nspv.hint')}
      data-tid="nspv-status"
      onClick={() => {
        setNspvLocalStatus(2);
        setTimeout(() => {
          sendToBitgo(BitgoAction.RECONNECT);
          dispatch.environment.UPDATE_NSPV_STATUS(!nspvStatus);
        }, 1000);
      }}
    >
      <StatusIcon nspvStatus={nspvLocalStatus} />
      <StatusText>
        {t(
          nspvLocalStatus === 1
            ? 'nspv.online'
            : nspvLocalStatus === 2
            ? 'nspv.connecting'
            : 'nspv.offline'
        )}
      </StatusText>
    </NspvIndicatorRoot>
  );
};

export default NspvIndicator;
