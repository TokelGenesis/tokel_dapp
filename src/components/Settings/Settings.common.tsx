import React from 'react';

import styled from '@emotion/styled';

// macOS System Settings: a caption, then one rounded box of rows split by hairlines.
const GroupRoot = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GroupTitle = styled.h2`
  margin: 0 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-text-2);
`;

const GroupBox = styled.div`
  border-radius: var(--tg-radius-l);
  background: var(--tg-surface);
  border: 1px solid var(--tg-separator);
  box-shadow: var(--tg-shadow-1);
  overflow: hidden;
`;

export const SettingsGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <GroupRoot>
    <GroupTitle>{title}</GroupTitle>
    <GroupBox>{children}</GroupBox>
  </GroupRoot>
);

const RowRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  padding: 10px 16px;
  & + & {
    border-top: 1px solid var(--tg-separator);
  }
  .text b {
    display: block;
    font-size: 13.5px;
    font-weight: 500;
  }
  .text small {
    display: block;
    font-size: 12px;
    color: var(--tg-text-2);
    margin-top: 1px;
  }
`;

export const SettingsRow = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) => (
  <RowRoot>
    <div className="text">
      <b>{label}</b>
      {hint && <small>{hint}</small>}
    </div>
    {children}
  </RowRoot>
);

export const SettingsBlock = styled.div`
  padding: 14px 16px 16px;
  & + & {
    border-top: 1px solid var(--tg-separator);
  }
`;

// (older name, still used by forms)
export const Subsection = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <SettingsGroup title={name}>
    <SettingsBlock>{children}</SettingsBlock>
  </SettingsGroup>
);
