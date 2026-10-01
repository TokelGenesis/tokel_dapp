import React from 'react';
import { useSelector } from 'react-redux';

import styled from '@emotion/styled';

import { useT } from 'i18n';
import { selectKey, selectSeed } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';

import Spinner from 'components/_General/Spinner';
import ConfirmString from './ConfirmString';
import GeneratedCredential from './GeneratedCredentials';

interface ProgressProps {
  width: string;
}

// "Step 1 of 3" with a thin bar, at the top of the card
const Progress = styled.div<ProgressProps>`
  width: 100%;
  margin-bottom: 18px;
  span {
    display: block;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--tg-text-3);
    text-align: center;
    margin-bottom: 6px;
  }
  div {
    height: 4px;
    border-radius: 4px;
    background: var(--tg-fill);
    overflow: hidden;
  }
  div::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.width ?? '0%'};
    background: var(--tg-brand-gradient);
    transition: width 0.3s ease;
  }
`;

const CreateWalletRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const STEP1 = 1;
const STEP2 = 2;
const STEP3 = 3;
const STEP4 = 4;

const CreateWallet = () => {
  const t = useT();
  const [step, setStep] = React.useState(STEP1);
  const back = () => setStep(step - 1);
  const forward = () => setStep(step + 1);

  const [showSpinner, setShowSpinner] = React.useState(false);
  const key = useSelector(selectKey);
  const seed = useSelector(selectSeed);

  React.useEffect(() => {
    if (step === STEP1) {
      sendToBitgo(BitgoAction.NEW_ADDRESS);
    }
  }, [step]);

  return (
    <CreateWalletRoot>
      <Progress width={`${(Math.min(step, STEP3) / 3) * 100}%`}>
        <span>{t('create.step', { n: Math.min(step, STEP3) })}</span>
        <div />
      </Progress>
      {step === STEP1 && <GeneratedCredential wifkey={key} seed={seed} forward={forward} />}
      {step === STEP2 && (
        <ConfirmString
          title={t('create.confirmSeedTitle')}
          desc={t('create.confirmSeedText')}
          originalString={seed}
          goBack={back}
          forward={forward}
        />
      )}
      {(step === STEP3 || step === STEP4) && (
        <ConfirmString
          title={t('create.confirmKeyTitle')}
          desc={t('create.confirmKeyText')}
          originalString={key}
          goBack={() => {
            back();
            setShowSpinner(false);
          }}
          forward={() => {
            forward();
            setShowSpinner(true);
            sendToBitgo(BitgoAction.LOGIN, { key });
          }}
        />
      )}
      <div style={{ height: '30px', display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        {showSpinner && <Spinner />}
      </div>
    </CreateWalletRoot>
  );
};

export default CreateWallet;
