import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import BagIcon from 'assets/Bag.svg';
import logo from 'assets/logo.svg';
import SwapIcon from 'assets/Swap.svg';
import ToggleIcon from 'assets/Toggle.svg';
import TokenIcon from 'assets/Token.svg';
import WalletIcon from 'assets/Wallet.svg';
import { Platform, usePlatform } from 'hooks/platform';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectView } from 'store/selectors';
import { TOPBAR_HEIGHT_PX, VERSIONS_MSG, ViewType } from 'vars/defines';

import NspvIndicator from 'components/NspvIndicator';
import WindowControls from 'components/WindowControls';
import MenuItem from './MenuItem';

export const menuData: Array<{ type: ViewType; name: TKey; icon: string }> = [
  { type: ViewType.DASHBOARD, name: 'menu.wallet', icon: WalletIcon },
  { type: ViewType.DEX, name: 'menu.dex', icon: BagIcon },
  { type: ViewType.CREATE_TOKEN, name: 'menu.create', icon: TokenIcon },
  { type: ViewType.SWAP, name: 'menu.swap', icon: SwapIcon },
  { type: ViewType.SETTINGS, name: 'menu.settings', icon: ToggleIcon },
];

// Full-height sidebar (macOS style): the window buttons sit on its top strip, which also drags the window.
const SideMenuRoot = styled.nav`
  position: relative;
  flex-shrink: 0;
  width: 216px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--tg-sidebar);
  backdrop-filter: saturate(180%) blur(24px);
  border-right: 1px solid var(--tg-separator);
  user-select: none;
`;

const Chrome = styled.div`
  height: ${TOPBAR_HEIGHT_PX}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 14px;
  -webkit-app-region: drag;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 2px 18px 14px;
  img {
    width: 24px;
    height: 24px;
  }
  span {
    font-family: var(--tg-font-display);
    font-weight: 600;
    font-size: 15px;
    letter-spacing: -0.01em;
  }
  b {
    color: var(--tg-accent-text);
    font-weight: 600;
  }
`;

const Items = styled.div`
  flex: 1;
  padding: 0 10px;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 10px 10px 14px;
  border-top: 1px solid var(--tg-separator);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const Version = styled.span`
  font-size: 11px;
  color: var(--tg-text-3);
`;

const Logout = styled.button`
  border: none;
  background: transparent;
  color: var(--tg-text-2);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--tg-radius-s);
  &:hover {
    background: var(--tg-fill);
    color: var(--tg-text);
  }
`;

const SideMenu = () => {
  const t = useT();
  const currentView = useSelector(selectView);
  const [currVersion, setCurrVersion] = React.useState(null);
  const isWindowsOrLinux = [Platform.WINDOWS, Platform.LINUX].includes(usePlatform());

  React.useEffect(() => {
    if (!currVersion) {
      window.tokelApi.send(VERSIONS_MSG);
    }

    return window.tokelApi.on(VERSIONS_MSG, (data: unknown) => {
      setCurrVersion((data as { version: string }).version);
    });
  }, [currVersion]);

  return (
    <SideMenuRoot data-tid="sidemenu" aria-label="Tokel">
      <Chrome>{isWindowsOrLinux && <WindowControls />}</Chrome>
      <Brand>
        <img alt="" src={logo} />
        <span>
          Tokel <b>Genesis</b>
        </span>
      </Brand>
      <Items>
        {menuData.map(menuItem => (
          <MenuItem
            key={menuItem.type}
            onClick={() => dispatch.environment.SET_VIEW(menuItem.type)}
            name={t(menuItem.name)}
            icon={menuItem.icon}
            selected={menuItem.type === currentView}
          />
        ))}
      </Items>
      <Footer>
        <NspvIndicator />
        <FooterRow>
          <Version>{currVersion ? t('nav.version', { v: currVersion }) : ''}</Version>
          <Logout type="button" data-tid="logout" onClick={() => dispatch.account.logout()}>
            {t('nav.logout')}
          </Logout>
        </FooterRow>
      </Footer>
    </SideMenuRoot>
  );
};

export { SideMenuRoot };

export default SideMenu;
