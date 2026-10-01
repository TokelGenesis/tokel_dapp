import React from 'react';

import styled from '@emotion/styled';
import { FieldHookConfig, useField } from 'formik';

const Container = styled.label`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  font-size: 13px;
  color: var(--tg-text);
  user-select: none;
  padding-left: 28px;
  min-height: 20px;
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  input:checked ~ span {
    background-color: var(--tg-accent);
    border-color: var(--tg-accent);
  }
  input:focus-visible ~ span {
    box-shadow: 0 0 0 3px var(--tg-focus);
  }
  input:checked ~ span:after {
    display: block;
  }
`;

const Checkmark = styled.span`
  position: absolute;
  top: 50%;
  left: 0;
  margin-top: -9px;
  height: 18px;
  width: 18px;
  background-color: var(--tg-input);
  border: 1px solid var(--tg-border);
  border-radius: 5px;
  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const Checkbox: React.FC<{ label: string } & FieldHookConfig<string>> = props => {
  const [field, meta] = useField(props);

  return (
    <>
      <Container>
        {props.label}
        <input {...field} type="checkbox" />
        <Checkmark />
      </Container>
      {meta.touched && meta.error && <div className="error">{meta.error}</div>}
    </>
  );
};

export default Checkbox;
