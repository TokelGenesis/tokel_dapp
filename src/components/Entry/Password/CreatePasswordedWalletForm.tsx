import React from 'react';

import styled from '@emotion/styled';

import { useT } from 'i18n';

import { dispatch } from 'store/rematch';

import ErrorMessage from 'components/_General/ErrorMessage';
import InputWithLabel from 'components/_General/InputWithLabel';

const CreatePasswordedWalletFormRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0 4px;
`;

interface CreatePasswordedWalletFormProps {
  onSubmit: (newWalletName: string) => void;
}

const CreatePasswordedWalletForm = ({ onSubmit }: CreatePasswordedWalletFormProps) => {
  const t = useT();
  const [privateKey, setPrivateKey] = React.useState('');
  const [walletName, setWalletName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passConfirm, setPassConfirm] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const createWallet = async () => {
    setLoading(true);
    try {
      if (walletName.length === 0) {
        throw new Error(t('pw.errName'));
      }
      if (walletName.includes(' ')) {
        throw new Error(t('pw.errSpaces'));
      }
      if (password !== passConfirm) {
        throw new Error(t('pw.errMatch'));
      }
      if (password.length < 8) {
        throw new Error(t('pw.errShort'));
      }
      await window.tokelApi.wallet.encrypt(walletName, privateKey, password);
      await dispatch.account.loadWallets();
      onSubmit(walletName);
      setPrivateKey('');
      setWalletName('');
      setPassword('');
      setPassConfirm('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <CreatePasswordedWalletFormRoot>
      <InputWithLabel
        id="wallet-name"
        value={walletName}
        onChange={e => setWalletName(e.target.value)}
        label={t('pw.name')}
      />
      <InputWithLabel
        id="private-key"
        value={privateKey}
        type="password"
        onChange={e => setPrivateKey(e.target.value)}
        label={t('pw.key')}
      />
      <InputWithLabel
        id="new-password"
        value={password}
        type="password"
        onChange={e => setPassword(e.target.value)}
        label={t('pw.newPassword')}
      />
      <InputWithLabel
        id="confirm-password"
        value={passConfirm}
        type="password"
        label={t('pw.confirmPassword')}
        onChange={e => setPassConfirm(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && createWallet()}
        button={{
          text: t('pw.save'),
          onClick: createWallet,
          loading,
        }}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </CreatePasswordedWalletFormRoot>
  );
};

export default CreatePasswordedWalletForm;
