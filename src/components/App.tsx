import React from 'react';
import { useSelector } from 'react-redux';

import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import axios from 'axios';

import { Platform, usePlatform } from 'hooks/platform';
import { dispatch } from 'store/rematch';
import { selectAccountReady, selectShowNetworkPrefs, selectTheme } from 'store/selectors';
import { cssVarStyle } from 'util/theming';
import { TOKEL_PRICE_UPDATE_PERIOD_MS, TOKEL_PRICE_URL } from 'vars/defines';
import { scrollbarStyle } from 'vars/styles/platformSpecific';

import Entry from 'components/Entry/Entry';
import Home from 'components/Home/Home';
import NetworkPrefs from 'components/Settings/NetworkPrefs';
import TopBar from './TopBar';

const AppRoot = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const fetchTokelPrice = async () => {
  if (!TOKEL_PRICE_URL) return;
  try {
    const priceJson = await axios(TOKEL_PRICE_URL, { timeout: 10000 });
    const price = Number(priceJson.data?.[0]?.price);
    // The feed is a remote, unauthenticated source: ignore anything that isn't a sane price.
    if (Number.isFinite(price) && price > 0 && price < 1e6) {
      dispatch.environment.SET_TOKEL_PRICE_USD(price);
    }
  } catch (e) {
    console.log(e);
  }
};

export default function App() {
  const accountReady = useSelector(selectAccountReady);
  const themeName = useSelector(selectTheme);
  const showNetworkPrefs = useSelector(selectShowNetworkPrefs);

  React.useEffect(() => {
    document.body.dataset.theme = themeName;
  }, [themeName]);

  React.useEffect(() => {
    fetchTokelPrice();
    const priceClock = setInterval(fetchTokelPrice, TOKEL_PRICE_UPDATE_PERIOD_MS);
    return () => {
      clearInterval(priceClock);
    };
  }, []);

  const isWindowsOrLinux = [Platform.WINDOWS, Platform.LINUX].includes(usePlatform());

  return (
    <AppRoot>
      <Global styles={[cssVarStyle, isWindowsOrLinux && scrollbarStyle].filter(Boolean)} />
      <TopBar />
      {accountReady ? <Home /> : <Entry />}
      {showNetworkPrefs && <NetworkPrefs />}
    </AppRoot>
  );
}
