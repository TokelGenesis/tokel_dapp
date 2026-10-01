import React from 'react';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import timesSvg from 'assets/times.svg';
import useLockScroll from 'hooks/lock-scroll';
import { DEFAULT_NULL_MODAL } from 'store/models/environment';
import { dispatch } from 'store/rematch';

export const ModalRoot = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--tg-overlay);
  backdrop-filter: blur(6px);
  overflow: auto;
  z-index: 100;
  opacity: 0;
`;

const ModalPanel = styled(motion.div)<{ size?: 'small' | 'medium' | 'large' }>`
  width: 100%;
  max-width: min(
    ${props => (props.size === 'large' ? '980px' : props.size === 'medium' ? '780px' : '460px')},
    92%
  );
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius-l);
  background-color: var(--tg-surface);
  color: var(--tg-text);
  box-shadow: var(--tg-shadow-3);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 14px 22px;
  font-family: var(--tg-font-display);
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--tg-separator);
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--tg-fill);
  display: grid;
  place-items: center;
  &:hover {
    background: var(--tg-fill-hover);
  }
  span {
    width: 11px;
    height: 11px;
    background-color: var(--tg-text-2);
    mask: url(${timesSvg}) no-repeat center / contain;
  }
`;

const Content = styled.div`
  padding: 20px 22px 22px;
  overflow-y: auto;
`;

const close = () => dispatch.environment.SET_MODAL(DEFAULT_NULL_MODAL);
const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && close();

type ModalProps = {
  title: string;
  children: React.ReactElement;
  size?: 'small' | 'medium' | 'large';
};

const Modal = ({ title, size, children }: ModalProps) => {
  // prevent anything in the background from being scrolled while modal is open
  useLockScroll();

  // close modal if click anywhere outside the content or press ESC
  React.useEffect(() => {
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <ModalRoot initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
      <ModalPanel
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: [0.22, 0.54, 0, 1] }}
        size={size}
      >
        <Header>
          {title}
          <CloseButton type="button" onClick={close} aria-label="Close" data-tid="modal-close">
            <span />
          </CloseButton>
        </Header>
        <Content>{children}</Content>
      </ModalPanel>
    </ModalRoot>
  );
};

export default Modal;
