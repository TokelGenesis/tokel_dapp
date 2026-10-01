import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import password from 'assets/password.svg';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectEnvError, selectLoginConfirm, selectLoginFeedback } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import { ErrorMessages } from 'vars/defines';

import { Button } from 'components/_General/buttons';
import ErrorMessage from 'components/_General/ErrorMessage';
import Input from 'components/_General/Input';
import Spinner from 'components/_General/Spinner';
import { BROKEN_WALLET_MSG } from 'components/BitgoOrchestrator';
import { VSpaceSmall } from 'components/Dashboard/widgets/common';

const LoginFormRoot = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Feedback = styled.p<{ bad?: boolean }>`
  margin: 0;
  text-align: center;
  font-size: 12.5px;
  color: ${p => (p.bad ? 'var(--tg-danger)' : 'var(--tg-text-2)')};
`;

const Status = styled.div`
  min-height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-top: 12px;
`;

const ConfirmBox = styled.div`
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--tg-radius);
  background: var(--tg-warning-soft);
  border: 1px solid var(--tg-separator);
  color: var(--tg-text);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  code {
    display: block;
    margin: 8px 0;
    padding: 8px 10px;
    border-radius: var(--tg-radius-s);
    background: var(--tg-surface);
    font-family: var(--tg-font-mono);
    font-size: 12.5px;
    word-break: break-all;
    font-weight: 600;
  }
`;

// what the orchestrator reports, shown in the chosen language
const FEEDBACK: Record<string, TKey> = {
  'Trying to connect to nspv...': 'pk.connecting',
  'Getting transactions...': 'pk.loading',
  [BROKEN_WALLET_MSG]: 'pk.broken',
};

const LoginForm = () => {
  const t = useT();
  const [loginValue, setLoginValue] = React.useState('');
  const [error, setError] = React.useState(null);
  const [showSpinner, setShowSpinner] = React.useState(false);

  const loginFeedback = useSelector(selectLoginFeedback);
  const loginConfirm = useSelector(selectLoginConfirm);
  const envError = useSelector(selectEnvError);

  const performLogin = React.useCallback(() => {
    dispatch.environment.SET_ERROR(null);
    if (!loginValue) {
      setError(ErrorMessages.ENTER_WIF);
      return;
    }
    sendToBitgo(BitgoAction.LOGIN, { key: loginValue });
  }, [loginValue]);

  const confirmLogin = React.useCallback(() => {
    dispatch.environment.SET_LOGIN_CONFIRM(null);
    sendToBitgo(BitgoAction.LOGIN, { key: loginValue, confirmed: true });
  }, [loginValue]);

  // leaving the form or changing the key drops a pending confirmation
  React.useEffect(() => () => dispatch.environment.SET_LOGIN_CONFIRM(null), []);

  React.useEffect(() => {
    setError(envError);
    if (error || envError) {
      setShowSpinner(false);
    }
  }, [error, envError]);

  React.useEffect(() => {
    if (loginFeedback) {
      if (loginFeedback === BROKEN_WALLET_MSG) {
        setShowSpinner(false);
        setLoginValue('');
      } else {
        setShowSpinner(true);
      }
    }
  }, [loginFeedback]);

  return (
    <LoginFormRoot>
      <Input
        autoFocus
        onChange={e => {
          dispatch.environment.SET_LOGIN_FEEDBACK(null);
          dispatch.environment.SET_LOGIN_CONFIRM(null);
          setError('');
          setLoginValue(e.target.value);
        }}
        tid="wif-input"
        onKeyDown={e => e.key === 'Enter' && performLogin()}
        icon={password}
        value={loginValue}
        placeholder={t('pk.placeholder')}
        type="password"
        width="100%"
        disabled={showSpinner}
      />
      <VSpaceSmall />
      {loginConfirm ? (
        <ConfirmBox data-tid="login-confirm">
          {t('pk.confirmText')}
          <code data-tid="login-confirm-address">{loginConfirm}</code>
          {t('pk.confirmCheck')}
          <VSpaceSmall />
          <Button
            onClick={confirmLogin}
            theme="purple"
            customWidth="100%"
            data-tid="login-confirm-button"
          >
            {t('pk.confirmGo')}
          </Button>
        </ConfirmBox>
      ) : (
        <Button
          onClick={performLogin}
          theme="purple"
          customWidth="100%"
          disabled={showSpinner}
          data-tid="login-button"
        >
          {t('pk.login')}
        </Button>
      )}
      <Status aria-live="polite">
        {showSpinner && <Spinner />}
        {error && (
          <ErrorMessage>{error === ErrorMessages.ENTER_WIF ? t('pk.enter') : error}</ErrorMessage>
        )}
        {loginFeedback && (
          <Feedback bad={loginFeedback === BROKEN_WALLET_MSG}>
            {FEEDBACK[loginFeedback] ? t(FEEDBACK[loginFeedback]) : loginFeedback}
          </Feedback>
        )}
      </Status>
    </LoginFormRoot>
  );
};

export default LoginForm;
