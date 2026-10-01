import React from 'react';

import styled from '@emotion/styled';

import { WindowControl } from 'vars/defines';

const WindowControlRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
`;

interface WindowButtonProps {
  control: string;
}

const WindowButton = styled.button<WindowButtonProps>`
  border: none;
  user-select: none;
  cursor: pointer;
  height: 12px;
  width: 12px;
  border-radius: 100px;
  background-color: var(--color-window-${p => p.control});
  &:hover {
    background-color: var(--color-window-${p => p.control}-hover);
  }
`;

const WindowControls = () => (
  <WindowControlRoot>
    {Object.values(WindowControl).map(control => (
      <WindowButton
        key={control}
        control={control}
        onClick={() => window.tokelApi.send('window-controls', control)}
      />
    ))}
  </WindowControlRoot>
);

export default WindowControls;
