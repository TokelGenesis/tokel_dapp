import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import trendUpIcon from 'assets/trendUp.svg';
import { TKey, useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectDeepLinkParams } from 'store/selectors';

import Icon from 'components/_General/_UIElements/Icon';
import SegmentedControl from 'components/_General/SegmentedControl';
import ViewContext, { MARKETPLACE_VIEWS } from './common/ViewContext';
import MarketOrderWidget from './widgets/MarketOrder';
import MyOffersWidget from './widgets/MyOffers';
import MyOrdersWidget from './widgets/MyOrders';

const SECTIONS: { type: MARKETPLACE_VIEWS; name: TKey }[] = [
  { type: MARKETPLACE_VIEWS.FILL, name: 'mk.fill' },
  { type: MARKETPLACE_VIEWS.ASK, name: 'mk.sell' },
  { type: MARKETPLACE_VIEWS.BID, name: 'mk.bid' },
  { type: MARKETPLACE_VIEWS.ORDERS, name: 'mk.orders' },
  { type: MARKETPLACE_VIEWS.OFFERS, name: 'mk.offers' },
];

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 20px;
  gap: 18px;
`;

const Bar = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`;

const FormColumn = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`;

const Welcome = styled.div`
  margin: auto;
  max-width: 420px;
  text-align: center;
  h2 {
    margin: 14px 0 6px;
    font-size: 20px;
  }
  p {
    margin: 0;
    color: var(--tg-text-2);
  }
`;

const Marketplace: React.FC = () => {
  const t = useT();
  const deepLinkParams = useSelector(selectDeepLinkParams);
  const [currentView, setCurrentView] = React.useState<MARKETPLACE_VIEWS | null>(null);
  const [currentOrderId, setCurrentOrderId] = React.useState<string | undefined>();

  const handleViewChange = (view: MARKETPLACE_VIEWS | null) => {
    setCurrentView(view);
    setCurrentOrderId(undefined);
  };

  React.useEffect(() => {
    if (deepLinkParams?.length) {
      const params = new URLSearchParams(deepLinkParams);
      const action =
        params.get('action') === 'bid' ? MARKETPLACE_VIEWS.BID : MARKETPLACE_VIEWS.FILL;

      setCurrentView(action);
      setCurrentOrderId(params.get('orderid') || params.get('tokenid'));

      dispatch.environment.SET_DEEP_LINK_PARAMS('');
    }
  }, [deepLinkParams, currentView]);

  const renderTab = () => {
    switch (currentView) {
      case MARKETPLACE_VIEWS.FILL:
        return (
          <FormColumn>
            <MarketOrderWidget type="fill" />
          </FormColumn>
        );
      case MARKETPLACE_VIEWS.ASK:
        return (
          <FormColumn>
            <MarketOrderWidget type="ask" />
          </FormColumn>
        );
      case MARKETPLACE_VIEWS.BID:
        return (
          <FormColumn>
            <MarketOrderWidget type="bid" />
          </FormColumn>
        );
      case MARKETPLACE_VIEWS.ORDERS:
        return <MyOrdersWidget />;
      case MARKETPLACE_VIEWS.OFFERS:
        return <MyOffersWidget />;
      case null:
      default:
        return (
          <Welcome data-tid="mktplace-welcome">
            <Icon icon={trendUpIcon} height={40} width={40} color="gradient" centered />
            <h2>{t('mk.welcome')}</h2>
            <p>{t('mk.welcomeText')}</p>
          </Welcome>
        );
    }
  };

  // the segmented control needs a string value; null (no section yet) selects nothing
  const value = currentView === null ? '' : String(currentView);

  return (
    <Root>
      <Bar>
        <SegmentedControl
          tid="mktplace-sidemenu"
          label={t('mk.sections')}
          value={value}
          options={SECTIONS.map(s => ({ value: String(s.type), label: t(s.name) }))}
          onChange={v => handleViewChange(Number(v) as MARKETPLACE_VIEWS)}
        />
      </Bar>
      <Content>
        <ViewContext.Provider
          value={{ currentView, setCurrentView, currentOrderId, setCurrentOrderId }}
        >
          {renderTab()}
        </ViewContext.Provider>
      </Content>
    </Root>
  );
};

export default Marketplace;
