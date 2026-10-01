import React from 'react';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import links from 'util/links';

const FeedbackRoot = styled.div`
  color: var(--color-gray);
  font-weight: 400;
  h4 {
    font-weight: 400;
  }
`;

const Feedback = () => {
  const t = useT();
  return (
    <FeedbackRoot>
      <h4>{t('fb.ask')}</h4>
      <ul>
        <li>
          {t('fb.issue1')}
          <a href={links.githubIssue} key="githubIssue" rel="noreferrer" target="_blank">
            {t('fb.issue2')}
          </a>
        </li>
        <li>
          {t('fb.discord1')}
          <a href={links.discord} key="discordFeedback" rel="noreferrer" target="_blank">
            Discord
          </a>
        </li>
        <li>
          {t('fb.mail1')}
          <a href={links.devEmail} key="devEmaillink" rel="noreferrer" target="_blank">
            {t('fb.mail2')}
          </a>{' '}
          (imperialtokel@gmail.com)
        </li>
      </ul>
      <p
        style={{
          margin: '2rem 1.5rem 2rem 0',
          textAlign: 'right',
        }}
      >
        {t('fb.sign')}
      </p>
    </FeedbackRoot>
  );
};

export default Feedback;
