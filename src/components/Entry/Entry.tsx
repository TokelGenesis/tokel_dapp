import React from 'react';

import styled from '@emotion/styled';

import logoPath from 'assets/logo.svg';
import KeyIcon from 'assets/password.svg';
import PlusIcon from 'assets/Plus.svg';
import ToggleIcon from 'assets/Toggle.svg';
import WalletIcon from 'assets/Wallet.svg';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { LoginType, TOPBAR_HEIGHT_PX } from 'vars/defines';

import BackButton from 'components/_General/BackButton';
import CreateWallet from './CreateWallet/CreateWallet';
import LoginWithPassword from './Password/LoginWithPassword';
import LoginWithPrivateKey from './PrivateKey/LoginWithPrivateKey';

const LoginRoot = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  overflow-y: auto;
  padding: ${TOPBAR_HEIGHT_PX + 8}px 24px 48px;
  /* a soft glow of the brand colours behind the card */
  background: radial-gradient(900px 420px at 50% -10%, var(--tg-accent-soft), transparent 70%),
    var(--tg-bg);
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 560px;
  margin-top: max(2vh, 8px);
  padding: 32px 36px 28px;
  border-radius: var(--tg-radius-l);
  background: var(--tg-surface);
  border: 1px solid var(--tg-separator);
  box-shadow: var(--tg-shadow-2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NetworkPrefsButton = styled.button`
  position: absolute;
  top: 14px;
  right: 16px;
  height: 30px;
  width: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: grid;
  place-items: center;
  -webkit-app-region: no-drag;
  &:hover {
    background: var(--tg-fill);
  }
  span {
    width: 16px;
    height: 16px;
    background: var(--tg-text-2);
    mask: url('${ToggleIcon}') center / contain no-repeat;
  }
`;

const Heading = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  img {
    width: 56px;
    height: 56px;
    margin-bottom: 14px;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const Tagline = styled.p`
  margin: 8px 0 22px;
  color: var(--tg-text-2);
  font-size: 13.5px;
  max-width: 380px;
`;

const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Option = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  border-radius: var(--tg-radius);
  border: 1px solid ${p => (p.primary ? 'transparent' : 'var(--tg-separator)')};
  background: ${p => (p.primary ? 'var(--tg-accent-soft)' : 'var(--tg-surface)')};
  color: var(--tg-text);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.08s ease;
  &:hover {
    background: ${p => (p.primary ? 'var(--tg-accent-soft)' : 'var(--tg-fill)')};
    border-color: var(--tg-accent);
  }
  &:active {
    transform: scale(0.995);
  }
  .ic {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: ${p => (p.primary ? 'var(--tg-accent)' : 'var(--tg-fill)')};
  }
  .ic span {
    width: 18px;
    height: 18px;
    background: ${p => (p.primary ? 'var(--tg-on-accent)' : 'var(--tg-text-2)')};
    mask-size: contain;
    mask-position: center;
    mask-repeat: no-repeat;
  }
  b {
    display: block;
    font-size: 14px;
    font-weight: 600;
  }
  small {
    display: block;
    color: var(--tg-text-2);
    font-size: 12.5px;
    margin-top: 1px;
  }
  .chev {
    margin-left: auto;
    color: var(--tg-text-3);
    font-size: 18px;
  }
`;

const SubHeader = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  margin-bottom: 18px;
  h1 {
    margin: 0;
    text-align: center;
    font-size: 18px;
  }
`;

const LoginViewWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface LoginView {
  type: LoginType;
  title: TKey;
  desc: TKey;
  heading: TKey;
  icon: string;
  component: () => JSX.Element;
}

const LoginViews: Record<LoginType, LoginView> = {
  [LoginType.PASSWORD]: {
    type: LoginType.PASSWORD,
    title: 'entry.password',
    desc: 'entry.passwordDesc',
    heading: 'entry.titlePassword',
    icon: WalletIcon,
    component: LoginWithPassword,
  },
  [LoginType.PRIVKEY]: {
    type: LoginType.PRIVKEY,
    title: 'entry.privkey',
    desc: 'entry.privkeyDesc',
    heading: 'entry.titlePrivkey',
    icon: KeyIcon,
    component: LoginWithPrivateKey,
  },
  [LoginType.CREATE]: {
    type: LoginType.CREATE,
    title: 'entry.create',
    desc: 'entry.createDesc',
    heading: 'entry.titleCreate',
    icon: PlusIcon,
    component: CreateWallet,
  },
};

const Login = () => {
  const t = useT();
  const [loginType, setLoginType] = React.useState<null | LoginType>(null);
  const currentLoginView = LoginViews[loginType];

  return (
    <LoginRoot>
      <Card>
        <NetworkPrefsButton
          type="button"
          title={t('entry.network')}
          aria-label={t('entry.network')}
          onClick={() => dispatch.environment.TOGGLE_SHOW_NETWORK_PREFS()}
        >
          <span />
        </NetworkPrefsButton>
        {!loginType ? (
          <Heading>
            <img alt="Tokel" src={logoPath} />
            <HeaderTitle>{t('entry.welcome')}</HeaderTitle>
            <Tagline>{t('entry.tagline')}</Tagline>
            <Options>
              {Object.values(LoginViews).map(view => (
                <Option
                  type="button"
                  key={view.type}
                  primary={view.type === LoginType.PRIVKEY}
                  data-tid={`entry-${view.type}`}
                  onClick={() => setLoginType(view.type)}
                >
                  <span className="ic">
                    <span
                      style={{
                        maskImage: `url('${view.icon}')`,
                        WebkitMaskImage: `url('${view.icon}')`,
                      }}
                    />
                  </span>
                  <span>
                    <b>{t(view.title)}</b>
                    <small>{t(view.desc)}</small>
                  </span>
                  <span className="chev" aria-hidden>
                    ›
                  </span>
                </Option>
              ))}
            </Options>
          </Heading>
        ) : (
          <>
            <SubHeader>
              <BackButton onClick={() => setLoginType(null)} label={t('entry.back')} />
              <h1>{t(currentLoginView.heading)}</h1>
              <span />
            </SubHeader>
            <LoginViewWrapper>
              <currentLoginView.component />
            </LoginViewWrapper>
          </>
        )}
      </Card>
    </LoginRoot>
  );
};

export default Login;
