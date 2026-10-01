import React from 'react';

import styled from '@emotion/styled';

import { useT } from 'i18n';

import { Button } from 'components/_General/buttons';
import ErrorMessage from 'components/_General/ErrorMessage';
import Link from 'components/_General/Link';
import TextArea from 'components/_General/TextArea';

type CredentialsRowProps = {
  title: string;
  originalString: string;
  desc: string;
  goBack: () => void;
  forward: () => void;
};

const ConfirmStringRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  .head {
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    align-items: center;
  }
  h2 {
    margin: 0;
    font-size: 15px;
    text-align: center;
  }
  .back {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
  p {
    color: var(--tg-text-2);
    margin: 10px 0 4px;
    font-size: 13px;
    text-align: center;
  }
`;

const ConfirmString = ({ title, desc, goBack, forward, originalString }: CredentialsRowProps) => {
  const t = useT();
  const [error, setError] = React.useState('');
  const [value, setValue] = React.useState('');

  const handleClick = (): void => {
    if (value === originalString) {
      forward();
    } else {
      setError(t('create.mismatch'));
    }
  };

  return (
    <ConfirmStringRoot>
      <h2>{title}</h2>
      <p>{desc}</p>
      <TextArea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setError('');
          setValue(e.currentTarget.value);
        }}
        height="84px"
        width="100%"
        margin="12px 0 0"
      />
      <ErrorMessage>{error}</ErrorMessage>
      <Button onClick={handleClick} customWidth="100%" theme="purple" data-tid="create-confirm">
        {t('create.confirm')}
      </Button>
      <div className="back">
        <Link onClick={goBack} linkText={t('create.prev')} />
      </div>
    </ConfirmStringRoot>
  );
};

export default ConfirmString;
