import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectModalName, selectView } from 'store/selectors';
import links from 'util/links';
import { Colors, DEEP_LINK_IPC_ID, ModalName, TOPBAR_HEIGHT_PX, ViewType } from 'vars/defines';

import { ButtonSmall } from 'components/_General/buttons';
import InfoNote from 'components/_General/InfoNote';
import CreateToken from 'components/CreateToken/CreateToken';
import Dashboard from 'components/Dashboard/Dashboard';
import SideMenu from 'components/Home/Menu/SideMenu';
import Marketplace from 'components/Marketplace/Marketplace';
import modals from 'components/Modal/content';
import Modal from 'components/Modal/Modal';
import Settings from 'components/Settings/Settings';

const HomeRoot = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--tg-bg);
`;

// The toolbar of the window: the page's title, and it drags the window (macOS unified toolbar).
const Toolbar = styled.header`
  height: ${TOPBAR_HEIGHT_PX}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 24px;
  border-bottom: 1px solid var(--tg-separator);
  -webkit-app-region: drag;
  user-select: none;
  h1 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
`;

const ViewWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  overflow: auto;
  overflow-x: hidden;
`;

const TITLES: Record<string, TKey> = {
  [ViewType.DASHBOARD]: 'menu.wallet',
  [ViewType.DEX]: 'menu.dex',
  [ViewType.CREATE_TOKEN]: 'menu.create',
  [ViewType.SWAP]: 'menu.swap',
  [ViewType.SETTINGS]: 'menu.settings',
};

const Unavailable = ({ name }: { name: TKey }) => {
  const t = useT();
  return (
    <InfoNote
      title={t('note.unavailable', { name: t(name) })}
      subtitle={[
        t('note.unavailableText'),
        ' ',
        <a key="discordLink" href={links.discord} rel="noreferrer" target="_blank">
          Discord
        </a>,
      ]}
    />
  );
};

const renderView = (viewType: ViewType[keyof ViewType]) => {
  switch (viewType) {
    case ViewType.DASHBOARD:
      return <Dashboard />;
    case ViewType.SWAP:
      return <Unavailable name="note.swap" />;
    case ViewType.DEX:
      return <Marketplace />;
    case ViewType.CREATE_TOKEN:
      return <CreateToken />;
    case ViewType.SETTINGS:
      return <Settings />;
    default:
      return <Unavailable name="note.swap" />;
  }
};

const Home = () => {
  const t = useT();
  const currentView = useSelector(selectView);
  const modalProps = modals[useSelector(selectModalName)];

  React.useEffect(() => {
    const listener = ({ view, params }: { view: string; params: string }) => {
      dispatch.environment.SET_VIEW(view || ViewType.DASHBOARD);
      if (params) dispatch.environment.SET_DEEP_LINK_PARAMS(params);
    };

    return window.tokelApi.on(DEEP_LINK_IPC_ID, listener as (...args: unknown[]) => void);
  }, []);

  return (
    <HomeRoot>
      <SideMenu />
      <Main>
        <Toolbar>
          <h1>{t(TITLES[currentView as string] ?? 'menu.wallet')}</h1>
          <ButtonSmall
            theme={Colors.TRANSPARENT}
            onClick={() => dispatch.environment.SET_MODAL_NAME(ModalName.FEEDBACK)}
          >
            {t('nav.feedback')}
          </ButtonSmall>
        </Toolbar>
        <ViewWrapper>{renderView(currentView)}</ViewWrapper>
      </Main>
      {modalProps && (
        <Modal size={modalProps.size} title={modalProps.title}>
          {modalProps.component}
        </Modal>
      )}
    </HomeRoot>
  );
};

export default Home;
