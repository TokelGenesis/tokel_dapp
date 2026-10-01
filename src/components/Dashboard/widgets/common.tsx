import styled from '@emotion/styled';

// a card: the surface colour, a hairline edge, a soft shadow (macOS grouped content)
export const WidgetContainer = styled.div`
  background-color: var(--tg-surface);
  border: 1px solid var(--tg-separator);
  border-radius: var(--tg-radius-l);
  box-shadow: var(--tg-shadow-1);
`;

export const WidgetTitle = styled.h2<{ bottomBorder?: boolean }>`
  padding: 16px 20px 12px;
  margin: 0;
  color: var(--tg-text);
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  border-bottom: 1px solid ${p => (p.bottomBorder ? 'var(--tg-separator)' : 'transparent')};
`;

export const WidgetDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--tg-separator);
`;

export const EmbedRoot = styled.div``;

export const EmbedContentContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 20px - 28px);
`;

export const GrayLabel = styled.p`
  font-size: 12.5px;
  color: var(--tg-text-2);
  margin: 0;
  padding: 0;
`;

export const GrayLabelUppercase = styled(GrayLabel)`
  text-transform: uppercase;
`;

export const HSpaceBig = styled.div`
  width: 32px;
`;
export const HSpaceMed = styled.div`
  width: 16px;
`;
export const HSpaceSmall = styled.div`
  width: 12px;
`;
export const HSpaceTiny = styled.div`
  width: 8px;
`;

export const VSpaceBig = styled.div`
  height: 32px;
`;
export const VSpaceMed = styled.div`
  height: 16px;
`;
export const VSpaceSmall = styled.div`
  height: 12px;
`;
export const VSpaceTiny = styled.div`
  height: 8px;
`;

type RowProp = {
  center?: boolean;
};

export const RowWrapper = styled.div<RowProp>`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: ${p => (p.center ? 'center' : 'flex-start')};
`;

export const ColWrapper = styled.div<RowProp>`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: ${p => (p.center ? 'center' : 'flex-start')};
`;
