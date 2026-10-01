import React from 'react';

import styled from '@emotion/styled';

import copyIcon from 'assets/copy.svg';
import { useT } from 'i18n';

// A small copy button: the icon, then "Copied" for a moment. `color` is accepted for older callers.
const CopyButton = styled.button<{ done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: 26px;
  padding: 0 8px;
  border: none;
  border-radius: var(--tg-radius-s);
  background: ${p => (p.done ? 'var(--tg-success-soft)' : 'var(--tg-fill)')};
  color: ${p => (p.done ? 'var(--tg-success)' : 'var(--tg-text-2)')};
  font-size: 12px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover {
    background: ${p => (p.done ? 'var(--tg-success-soft)' : 'var(--tg-fill-hover)')};
    color: ${p => (p.done ? 'var(--tg-success)' : 'var(--tg-text)')};
  }
  i {
    width: 14px;
    height: 14px;
    background: currentColor;
    mask: url('${copyIcon}') center / contain no-repeat;
  }
`;

type CopyProps = {
  textToCopy: string;
  // eslint-disable-next-line react/no-unused-prop-types
  color?: string; // older callers pass it; the button follows the theme
};

const CopyToClipboard = ({ textToCopy }: CopyProps) => {
  const t = useT();
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return undefined;
    const timer = setTimeout(() => setDone(false), 1500);
    return () => clearTimeout(timer);
  }, [done]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(textToCopy));
      setDone(true);
    } catch {
      setDone(false);
    }
  };
  return (
    <CopyButton
      type="button"
      done={done}
      onClick={copy}
      aria-label={t('copy.copy')}
      data-tid="copy"
    >
      {!done && <i aria-hidden />}
      {done ? t('copy.copied') : t('copy.copy')}
    </CopyButton>
  );
};

export default CopyToClipboard;
