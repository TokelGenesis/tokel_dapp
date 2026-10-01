import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectAccountWalletName } from 'store/selectors';
import { Appearance, LanguagePref, setPref, usePrefs } from 'util/prefs';
import { Colors } from 'vars/defines';

import { ButtonSmall } from 'components/_General/buttons';
import SegmentedControl from 'components/_General/SegmentedControl';
import ChangePasswordForm from './ChangePasswordForm';
import { SettingsGroup, SettingsRow } from './Settings.common';

const SettingsRoot = styled.div`
  width: 100%;
  max-width: 680px;
  padding: 28px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const Value = styled.span`
  font-size: 13px;
  color: var(--tg-text-2);
`;

const Settings = () => {
  const t = useT();
  const { appearance, language } = usePrefs();
  const existingWalletName = useSelector(selectAccountWalletName);

  return (
    <SettingsRoot data-tid="settings">
      <SettingsGroup title={t('set.general')}>
        <SettingsRow label={t('set.appearance')} hint={t('set.appearanceHint')}>
          <SegmentedControl<Appearance>
            label={t('set.appearance')}
            tid="set-appearance"
            value={appearance}
            onChange={v => setPref('appearance', v)}
            options={[
              { value: 'system', label: t('set.system') },
              { value: 'light', label: t('set.light') },
              { value: 'dark', label: t('set.dark') },
            ]}
          />
        </SettingsRow>
        <SettingsRow label={t('set.language')} hint={t('set.languageHint')}>
          <SegmentedControl<LanguagePref>
            label={t('set.language')}
            tid="set-language"
            value={language}
            onChange={v => setPref('language', v)}
            options={[
              { value: 'system', label: t('set.system') },
              { value: 'en', label: 'English' },
              { value: 'zh', label: '繁體中文' },
            ]}
          />
        </SettingsRow>
        <SettingsRow label={t('set.currency')}>
          <Value>USD</Value>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title={t('set.network')}>
        <SettingsRow label={t('set.networkRow')} hint={t('set.networkHint')}>
          <ButtonSmall
            theme={Colors.BLACK}
            data-tid="set-network"
            onClick={() => dispatch.environment.TOGGLE_SHOW_NETWORK_PREFS()}
          >
            {t('set.open')}
          </ButtonSmall>
        </SettingsRow>
      </SettingsGroup>

      {existingWalletName && <ChangePasswordForm />}
    </SettingsRoot>
  );
};

export default Settings;
