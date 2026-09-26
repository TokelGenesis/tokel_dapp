import React from 'react';

import styled from '@emotion/styled';
import { ProgressInfo } from 'builder-util-runtime';

import { V } from 'util/theming';

import { ButtonSmall } from 'components/_General/buttons';

interface UpdateInfo {
  checking: boolean;
  available: boolean;
  progress?: ProgressInfo;
  downloaded: boolean;
  error: boolean;
}

const UpdaterRoot = styled.div`
  display: flex;
  padding: 18px;
`;

const UpdateText = styled.span`
  color: ${V.color.frontSoft};
  padding: 10px;
  margin-left: 1rem;
`;

const restartApp = () => window.tokelApi.send('update-restart');

const Updater = () => {
  const [update, setUpdate] = React.useState<UpdateInfo>({
    checking: false,
    available: false,
    progress: undefined,
    downloaded: false,
    error: false,
  });

  const checkForUpdate = () => {
    setUpdate(u => ({ ...u, error: false, checking: true }));
    window.tokelApi.send('update-check');
  };

  React.useEffect(checkForUpdate, []);

  React.useEffect(() => {
    const unsubs = [
      window.tokelApi.on('update-error', payload => {
        console.log(payload);
        setUpdate(u => ({ ...u, checking: false, error: true }));
      }),
      window.tokelApi.on('update-not-available', payload => {
        console.log(payload);
        setUpdate(u => ({ ...u, checking: false, error: false, available: false }));
      }),
      window.tokelApi.on('update-available', () =>
        setUpdate(u => ({ ...u, checking: false, error: false, available: true }))
      ),
      window.tokelApi.on('download-progress', payload =>
        setUpdate(u => ({ ...u, checking: false, error: false, progress: payload as ProgressInfo }))
      ),
      window.tokelApi.on('update-downloaded', () =>
        setUpdate(u => ({ ...u, checking: false, error: false, downloaded: true }))
      ),
    ];
    return () => unsubs.forEach(fn => fn());
  });

  return (
    <UpdaterRoot>
      {update.downloaded ? (
        <ButtonSmall onClick={restartApp}>Click to restart</ButtonSmall>
      ) : update.available ? (
        <ButtonSmall onClick={() => console.log('lol')}>Click to download</ButtonSmall>
      ) : (
        <ButtonSmall onClick={checkForUpdate}>check for update</ButtonSmall>
      )}
      <UpdateText>
        {update.checking ? (
          'Checking for update...'
        ) : update.error ? (
          'An unknown error occurred'
        ) : update.progress ? (
          <>Downloading... ({Math.round(update.progress.percent)}%)</>
        ) : update.downloaded ? (
          'Downloaded successfully'
        ) : update.available ? (
          'Update available, download now'
        ) : (
          'No update available'
        )}
      </UpdateText>
    </UpdaterRoot>
  );
};

export default Updater;
