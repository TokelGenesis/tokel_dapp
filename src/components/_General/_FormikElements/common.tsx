import { GroupBase, StylesConfig } from 'react-select';

import { css } from '@emotion/react';

import { V } from 'util/theming';

const inputStyles = css`
  border-radius: var(--tg-radius-s);
  background-color: var(--tg-input);
  color: var(--tg-text);
  border: 1px solid var(--tg-border);
  font-size: 13px;
  padding: 8px 10px;
  width: 100%;
  font-family: var(--tg-font);
  resize: none;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &::placeholder {
    color: var(--tg-text-3);
  }
  &[readOnly],
  &[disabled] {
    background-color: var(--tg-fill);
    color: var(--tg-text-2);
  }
  &:focus {
    outline: none;
    border-color: var(--tg-accent);
    box-shadow: 0 0 0 3px var(--tg-focus);
  }
`;

const useReactSelectStyles = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customStyles: StylesConfig<any, false, GroupBase<any>> = {
    menu: provided => ({
      ...provided,
      backgroundColor: 'var(--tg-surface)',
      border: '1px solid var(--tg-separator)',
      boxShadow: 'var(--tg-shadow-2)',
      borderRadius: 10,
      overflow: 'hidden',
    }),

    control: provided => ({
      ...css(provided, inputStyles, {
        padding: '0',
        minHeight: '36px',
      }),
    }),

    input: provided => ({
      ...provided,
      color: V.color?.frontSofter,
    }),

    placeholder: provided => ({
      ...provided,
      marginRight: 'auto',
      color: 'var(--tg-text-3)',
    }),

    singleValue: provided => ({
      ...provided,
      color: V.color?.frontSofter,
    }),

    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? V.color?.cornflower : '',
    }),

    indicatorSeparator: () => ({
      display: 'none',
    }),

    indicatorsContainer: provided => ({
      ...css(
        provided,
        `
        svg {
          fill: var(--tg-text-2);
        }
      `
      ),
    }),
  };

  return customStyles;
};

export { useReactSelectStyles, inputStyles };
