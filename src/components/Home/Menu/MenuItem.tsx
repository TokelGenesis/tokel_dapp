import React from 'react';

import styled from '@emotion/styled';

type MenuItemRootProps = {
  selected: boolean;
};

type MenuIconProps = {
  icon: string;
};

type MenuItemProps = {
  onClick: () => void;
  name: string;
  icon: string;
  selected: boolean;
};

// A sidebar row, as in Finder or Mail: icon and name, a rounded highlight when chosen.
const MenuItemRoot = styled.button<MenuItemRootProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  margin: 1px 0;
  border: none;
  border-radius: var(--tg-radius-s);
  font-size: 13px;
  font-weight: ${p => (p.selected ? 600 : 500)};
  text-align: left;
  color: ${p => (p.selected ? 'var(--tg-accent-text)' : 'var(--tg-text)')};
  background: ${p => (p.selected ? 'var(--tg-accent-soft)' : 'transparent')};
  transition: background 0.12s ease;
  &:hover {
    background: ${p => (p.selected ? 'var(--tg-accent-soft)' : 'var(--tg-fill)')};
  }
`;

const MenuIcon = styled.span<MenuIconProps>`
  flex-shrink: 0;
  height: 18px;
  width: 18px;
  background: currentColor;
  opacity: 0.9;
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-image: url('${p => p.icon}');
`;

const MenuItem = ({ name, icon, selected, onClick }: MenuItemProps) => (
  <MenuItemRoot
    type="button"
    onClick={onClick}
    selected={selected}
    aria-current={selected ? 'page' : undefined}
  >
    <MenuIcon icon={icon} aria-hidden />
    <span>{name}</span>
  </MenuItemRoot>
);

export default MenuItem;
