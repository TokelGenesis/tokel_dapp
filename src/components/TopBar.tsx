import React from 'react';

import styled from '@emotion/styled';

import { Platform, usePlatform } from 'hooks/platform';
import { TOPBAR_HEIGHT_PX } from 'vars/defines';

import WindowControls from 'components/WindowControls';

// The window's title bar before logging in: transparent, drags the window, and on Windows and Linux carries the
// window buttons (macOS draws its own). After logging in the sidebar and the toolbar take this role (Home).
const TopBarRoot = styled.div`
  position: absolute; /* over the page, so the page's background runs up behind it */
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: ${TOPBAR_HEIGHT_PX}px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
`;

const TopBar = () => {
  const isWindowsOrLinux = [Platform.WINDOWS, Platform.LINUX].includes(usePlatform());
  return <TopBarRoot>{isWindowsOrLinux && <WindowControls />}</TopBarRoot>;
};

export default TopBar;
