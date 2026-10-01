import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import timesSvg from 'assets/times.svg';
import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectNetworkPrefs } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { Colors, NetworkType } from 'vars/defines';

import { Button } from 'components/_General/buttons';
import Select from 'components/_General/Select';
import TextArea from 'components/_General/TextArea';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: var(--tg-overlay);
  backdrop-filter: blur(6px);
`;

const NetworkPrefsRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 420px;
  max-width: 92vw;
  background-color: var(--tg-surface);
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius-l);
  box-shadow: var(--tg-shadow-3);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  padding: 16px 16px 14px 22px;
  font-family: var(--tg-font-display);
  font-size: 16px;
  font-weight: 600;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--tg-separator);
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--tg-fill);
  display: grid;
  place-items: center;
  &:hover {
    background: var(--tg-fill-hover);
  }
  span {
    width: 11px;
    height: 11px;
    background-color: var(--tg-text-2);
    mask: url(${timesSvg}) no-repeat center / contain;
  }
`;

const Content = styled.div`
  display: flex;
  padding: 20px 22px 8px;
  flex-direction: column;
  gap: 14px;
`;

const Section = styled.div``;

const Label = styled.p`
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 6px 2px;
  color: var(--tg-text-2);
`;

const ErrorMessage = styled.span`
  font-size: 12.5px;
  color: var(--tg-danger);
`;

const Hint = styled.p`
  margin: 6px 0 0 2px;
  font-size: 12px;
  color: var(--tg-text-3);
`;

const SaveButton = styled(Button)`
  align-self: flex-end;
  margin: 8px 22px 20px;
`;

const networkOptions = Object.values(NetworkType).map(networkName => ({
  label: networkName,
  value: networkName,
}));

const NetworkPrefs = () => {
  const t = useT();
  const networkPrefs = useSelector(selectNetworkPrefs);
  const [network, setNetwork] = React.useState(networkPrefs.network);
  const [overrides, setOverrides] = React.useState(JSON.stringify(networkPrefs.overrides));
  const [settingNetwork, setSettingNetwork] = React.useState(false);
  const [invalidJson, setInvalidJson] = React.useState(false);

  const handleOverridesChange = e => {
    const { value } = e.target;
    setOverrides(value);
    try {
      JSON.parse(value);
      setInvalidJson(false);
    } catch {
      setInvalidJson(true);
    }
  };

  const saveNetworkPrefs = () => {
    setSettingNetwork(true);
    const networkPayload = { network, overrides: JSON.parse(overrides) };
    sendToBitgo(BitgoAction.SET_NETWORK, networkPayload);
    dispatch.environment.SET_NETWORK({
      ...networkPayload,
      show: true,
    });
  };

  return (
    <Backdrop>
      <NetworkPrefsRoot role="dialog" aria-label={t('net.title')} data-tid="network-prefs">
        <Header>
          {t('net.title')}
          <CloseButton
            type="button"
            aria-label={t('net.close')}
            data-tid="network-close"
            onClick={() => dispatch.environment.SET_SHOW_NETWORK_PREFS(false)}
          >
            <span />
          </CloseButton>
        </Header>
        <Content>
          <Section>
            <Label>{t('net.network')}</Label>
            <Select<NetworkType>
              options={networkOptions}
              defaultValue={networkPrefs.network}
              onSelect={setNetwork}
            />
          </Section>
          <Section>
            <Label>{t('net.overrides')}</Label>
            <TextArea
              height="100px"
              width="100%"
              value={overrides}
              onChange={handleOverridesChange}
              margin="0"
            />
            {invalidJson ? (
              <ErrorMessage>{t('net.badJson')}</ErrorMessage>
            ) : (
              <Hint>{t('net.overridesHint')}</Hint>
            )}
          </Section>
        </Content>
        <SaveButton
          theme={Colors.PURPLE}
          customWidth="120px"
          data-tid="network-save"
          disabled={invalidJson || settingNetwork}
          onClick={saveNetworkPrefs}
        >
          {settingNetwork ? '…' : t('net.save')}
        </SaveButton>
      </NetworkPrefsRoot>
    </Backdrop>
  );
};

export default NetworkPrefs;
