import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';

import { selectAccountWalletName } from 'store/selectors';

import ErrorMessage from 'components/_General/ErrorMessage';
import InputWithLabel from 'components/_General/InputWithLabel';
import { Subsection } from './Settings.common';

const ChangePasswordFormRoot = styled.div`
  width: 100%;
  & > section > div > div {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const Done = styled.p`
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--tg-success);
`;

const ChangePasswordForm = () => {
  const t = useT();
  const existingWalletName = useSelector(selectAccountWalletName);

  const [currentPass, setCurrentPass] = React.useState('');
  const [newPass, setNewPass] = React.useState('');
  const [newPassConfirm, setNewPassConfirm] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const changePassword = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (newPass !== newPassConfirm) {
        throw new Error(t('pw.errMatch'));
      }
      if (newPass.length < 8) {
        throw new Error(t('pw.errShort'));
      }
      if (newPass === currentPass) {
        throw new Error(t('set.pwSame'));
      }
      await window.tokelApi.wallet.changePassword(existingWalletName, currentPass, newPass);
      setError(null);
      setSuccess(t('set.pwDone'));
      setCurrentPass('');
      setNewPass('');
      setNewPassConfirm('');
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <ChangePasswordFormRoot>
      <Subsection name={t('set.password')}>
        <InputWithLabel
          id="old-password"
          value={currentPass}
          type="password"
          onChange={e => setCurrentPass(e.target.value)}
          label={t('set.pwCurrent')}
        />
        <InputWithLabel
          id="new-password"
          value={newPass}
          type="password"
          onChange={e => setNewPass(e.target.value)}
          label={t('set.pwNew')}
        />
        <InputWithLabel
          id="confirm-password"
          value={newPassConfirm}
          type="password"
          onChange={e => setNewPassConfirm(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') changePassword();
          }}
          label={t('set.pwConfirm')}
          button={{
            text: t('set.pwSave'),
            onClick: changePassword,
            loading,
          }}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <Done role="status">{success}</Done>}
      </Subsection>
    </ChangePasswordFormRoot>
  );
};

export default ChangePasswordForm;
