import { css } from '@emotion/react';
import { isObject, merge, omit } from 'lodash';

// settings
const ignoredKeys = ['name'];

// themes: every colour points at a design token in vars/styles/variables.css (light and dark are set there)
const baseTheme = {
  color: {
    cornflower: 'var(--tg-accent-text)',
    cornflowerHard: 'var(--tg-accent)',
    lilac: 'var(--tg-brand-2)',
    cerise: 'var(--tg-danger)',
    slate: 'var(--tg-text-3)',
    danger: 'var(--tg-danger)',
    growth: 'var(--tg-success)',
    undergrowth: 'var(--tg-success-soft)',
    highlight: 'var(--tg-accent-text)',
    success: 'var(--tg-success)',
    modal: {
      bg: 'var(--tg-surface)',
    },
    windowControl: {
      close: '#ff5f57',
      closeHover: '#e0443e',
      min: '#febc2e',
      minHover: '#dea123',
      max: '#28c840',
      maxHover: '#1aab29',
    },
  },
  font: {
    h1: '1.625rem',
    h2: '1.25rem',
    h3: '1.0625rem',
    p: '0.9375rem',
    pSmall: '0.8125rem',
    pSmaller: '0.75rem',
    pSmallest: '0.625rem',
  },
  size: {
    borderRadius: '8px',
    borderRadiusBig: '12px',
  },
  grid: {
    columnGap: '0.75rem',
  },
};

const tokenColors = {
  back: 'var(--tg-bg)',
  backSoft: 'var(--tg-bg)',
  backSofter: 'var(--tg-surface)',
  backSoftest: 'var(--tg-fill-strong)',
  backHard: 'var(--tg-bg-2)',
  backHarder: 'var(--tg-surface)',
  front: 'var(--tg-text)',
  frontSoft: 'var(--tg-text-2)',
  frontSofter: 'var(--tg-text-2)',
  frontOp: {
    50: 'var(--tg-text-3)',
  },
};

export const darkTheme = { name: 'dark', color: tokenColors };
export const lightTheme = { name: 'light', color: tokenColors };

// typing
const referenceTheme = omit(merge({}, baseTheme, darkTheme), ignoredKeys);

export const themes = [lightTheme, darkTheme];
export const themeNames = themes.map(t => t.name);

export type Theme = typeof referenceTheme;
export type ThemeName = typeof themeNames[number];
export type ThemeSubset = { [key: string]: string | ThemeSubset };

// build CSS vars recursively for use with emotion
const cssVarPrefix = '-';
const varNameBuilder = (...args: string[]) => args.join('-');

const flattenTheme = (theme: ThemeSubset, prefix: string): ThemeSubset => {
  return Object.entries(theme).reduce((flat, [k, v]) => {
    if (ignoredKeys.includes(k)) {
      return flat;
    }
    const varName = varNameBuilder(prefix, k);
    return isObject(v) ? { ...flat, ...flattenTheme(v, varName) } : { ...flat, [varName]: v };
  }, {});
};

const collect: ThemeSubset[] = [baseTheme, ...themes];
const cssVarObject = collect.reduce(
  (obj, theme) =>
    merge(
      {},
      obj,
      theme.name
        ? { [`body[data-theme='${theme.name}']`]: flattenTheme(theme, cssVarPrefix) }
        : { body: flattenTheme(theme, cssVarPrefix) }
    ),
  { body: {} }
);
export const cssVarStyle = css(cssVarObject);

// build typed helper for easy usage in emotion taggged template literals / elsewhere
const constructVarHelper = (refTheme: ThemeSubset, prefix: string): Theme => {
  const V: ThemeSubset = {};
  Object.entries(refTheme).forEach(([k, v]) => {
    if (!ignoredKeys.includes(k)) {
      V[k] = isObject(v)
        ? constructVarHelper(v, varNameBuilder(prefix, k))
        : `var(${varNameBuilder(prefix, k)})`;
    }
  });
  return V as Theme;
};

export const V = constructVarHelper(referenceTheme, cssVarPrefix);
