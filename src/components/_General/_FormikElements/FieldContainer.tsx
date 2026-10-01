import React from 'react';

import styled from '@emotion/styled';
import Tippy from '@tippyjs/react';
import { FieldHookConfig, useField } from 'formik';

import InfoIcon from 'assets/HelperInfoCircle.svg';

import Icon from 'components/_General/_UIElements/Icon';

const FieldContainerStyled = styled.div<{ appendLight?: boolean }>`
  margin-bottom: 14px;
  .error {
    color: var(--tg-danger);
    font-size: 12px;
    margin-top: 4px;
  }
  .field {
    position: relative;
  }
  .append {
    position: absolute;
    right: 1px;
    top: 1px;
    bottom: 1px;
    display: flex;
    align-items: center;
    background-color: var(--tg-fill);
    color: var(--tg-text-2);
    padding: 0 12px;
    font-size: 13px;
    font-weight: 600;
    border-left: 1px solid var(--tg-separator);
    border-top-right-radius: var(--tg-radius-s);
    border-bottom-right-radius: var(--tg-radius-s);
  }
`;

const Label = styled.label`
  font-size: 12px;
  color: var(--tg-text-2);
  font-weight: 600;
  display: flex;
  align-items: center;
  margin: 0 0 5px 2px;
  .icon {
    margin-left: 0.35rem;
  }
`;

interface FieldContainerProps {
  label?: string;
  help?: string;
  append?: string;
  appendLight?: boolean;
}

const FieldContainer: React.FC<FieldContainerProps & FieldHookConfig<string>> = ({
  children,
  label,
  help,
  append,
  appendLight,
  ...props
}) => {
  const [, meta] = useField(props);

  return (
    <FieldContainerStyled appendLight={appendLight}>
      {Boolean(label) && (
        <Label>
          {label}

          {Boolean(help?.length) && (
            <Tippy content={help} arrow>
              <Icon icon={InfoIcon} color="gradient" width={14} height={14} className="icon" />
            </Tippy>
          )}
        </Label>
      )}
      <div className="field">
        {children}
        {Boolean(append) && <span className="append">{append}</span>}
      </div>

      {meta.touched && meta.error && typeof meta.error !== 'object' && (
        <div className="error">{meta.error}</div>
      )}
    </FieldContainerStyled>
  );
};

export default FieldContainer;
