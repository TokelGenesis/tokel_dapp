import React from 'react';
import { useSelector } from 'react-redux';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Form, FormikProvider, useFormik } from 'formik';
import { toBitcoin, toSatoshi } from 'satoshi-bitcoin';

import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { selectModalOptions } from 'store/selectors';
import { BitgoAction, sendToBitgo } from 'util/bitgoHelper';
import formatTokenFormIntoStandard from 'util/formatTokenFormIntoStandard';
import { Responsive } from 'util/helpers';
import { V } from 'util/theming';
import { TokenForm } from 'util/token-types';
import TokenType from 'util/types/TokenType';
import useTokenCreationSchema from 'util/validators/useTokenCreationSchema';
import { FEE, ModalName, TICKER, TOKEN_MARKER_FEE } from 'vars/defines';

import Checkbox from 'components/_General/_FormikElements/Checkbox';
import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';
import TokenMediaDisplay from 'components/_General/TokenMediaDisplay';

const MediaPreviewContainer = styled.div`
  text-align: center;
  max-height: 480px;
  overflow-y: scroll;

  h1 {
    margin-bottom: 0;
  }

  p {
    color: ${V.color.frontSoft};
    font-size: ${V.font.h3};
    margin-top: 0;
  }
`;

const InformationLabel = styled(Column)`
  font-size: 13px;
  font-weight: 500;
  overflow-wrap: anywhere;
`;
const InformationValue = styled(Column)`
  font-size: 13px;
  color: var(--tg-text-2);
  overflow-wrap: anywhere;
`;

const InformationRow = styled(Columns)`
  margin-bottom: 2px !important;
`;

const Bottom = styled.div`
  margin-top: auto;
  padding-top: 5px;
  ${Button} {
    margin-top: 12px;
  }
`;

const CustomAttributesDivider = styled.div`
  margin-top: 10px;
  margin-bottom: 25px;
  border-bottom: 1px dashed ${V.color.frontSoft};
  width: 70%;
  margin-left: auto;
  margin-right: auto;
`;

const NotApplicable = () => {
  const t = useT();
  return <i>{t('tok.na')}</i>;
};

const ConfirmTokenCreationModal: React.FC = () => {
  const t = useT();
  const token = useSelector(selectModalOptions) as unknown as TokenForm;

  const tokenCreationSchema = useTokenCreationSchema();

  const tokenHelpers = React.useMemo(() => {
    const tokenType = token.supply === 1 ? TokenType.NFT : TokenType.TOKEN;
    const tokenTypeName = tokenType === TokenType.NFT ? t('tok.nft') : t('tok.token');
    const tokenTypeNameCapitalized = tokenTypeName;

    const cost = toBitcoin(String(toSatoshi(FEE + TOKEN_MARKER_FEE) + Number(token.supply)));

    const collectionAttributes =
      tokenType === TokenType.NFT
        ? [
            {
              label: t('tok.lblCollection'),
              value: token?.arbitraryAsJson?.collection_name || <NotApplicable />,
            },
            {
              label: t('tok.lblNumber'),
              value: token?.arbitraryAsJson?.number_in_collection || <NotApplicable />,
            },
          ]
        : [];

    const tokenDisplayAttributes = [
      { label: t('tok.lblSupply'), value: token?.supply },
      {
        label: t('tok.lblUrl'),
        value: token?.url || <NotApplicable />,
      },
      {
        label: t('tok.lblRoyalty'),
        value: token?.royalty ? t('tok.onDex', { n: token?.royalty }) : <NotApplicable />,
      },
      {
        label: tokenType === TokenType.NFT ? t('tok.lblCollectionId') : t('tok.lblId'),
        value: token?.id || <NotApplicable />,
      },
      ...collectionAttributes,
    ];

    const tokenCustomAttributes = token?.arbitraryAsJsonUnformatted?.map(({ key, value }) => ({
      label: key,
      value,
    }));

    return {
      tokenType,
      tokenTypeName,
      tokenTypeNameCapitalized,
      cost,
      collectionAttributes,
      tokenDisplayAttributes,
      tokenCustomAttributes,
    };
  }, [token, t]);

  const {
    tokenType,
    tokenTypeName,
    tokenTypeNameCapitalized,
    cost,
    tokenDisplayAttributes,
    tokenCustomAttributes,
  } = tokenHelpers;

  const formikBag = useFormik<TokenForm>({
    validationSchema: tokenCreationSchema,
    initialValues: { ...token, confirmation: false },
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: values => {
      sendToBitgo(BitgoAction.TOKEN_V2_CREATE_TOKEL, formatTokenFormIntoStandard(values));
      dispatch.environment.SET_MODAL({
        name: ModalName.TOKEN_CREATED,
        options: {
          tokenType,
          tokenTypeName,
          tokenTypeNameCapitalized,
        },
      });
    },
  });

  const { submitForm, isSubmitting, isValid } = formikBag;

  if (!token) return null;

  return (
    <FormikProvider value={formikBag}>
      <Form>
        <Columns
          css={css`
            align-items: stretch;
          `}
        >
          <Column
            size={5}
            css={css`
              ${Responsive.above.L} {
                padding-right: 35px;
              }
            `}
          >
            <MediaPreviewContainer>
              <TokenMediaDisplay url={token.url} />
              <h1>{token.name}</h1>
              <p>{token.description}</p>
            </MediaPreviewContainer>
          </Column>
          <Column
            size={7}
            css={css`
              ${Responsive.above.L} {
                border-left: 1px solid var(--color-modal-border);
                padding-left: 35px;
              }
              display: flex;
              flex-direction: column;
            `}
          >
            <div
              css={css`
                max-height: 42vh;
                overflow-y: auto;
              `}
            >
              {tokenDisplayAttributes.map(({ label, value }) => (
                <InformationRow key={label}>
                  <InformationLabel size={5}>{label}</InformationLabel>
                  <InformationValue>{value}</InformationValue>
                </InformationRow>
              ))}
              {Boolean(tokenCustomAttributes?.length) && <CustomAttributesDivider />}
              {tokenCustomAttributes.map(({ label, value }) => (
                <InformationRow key={label}>
                  <InformationLabel size={5}>{label}</InformationLabel>
                  <InformationValue>{value}</InformationValue>
                </InformationRow>
              ))}
            </div>

            <Bottom>
              <Checkbox
                name="confirmation"
                label={t('tok.cost', { type: tokenTypeName, cost, ticker: TICKER })}
              />
              <Button
                type="button"
                onClick={submitForm}
                theme="purple"
                disabled={isSubmitting || !isValid}
                data-tid="create-token"
              >
                {t('tok.create', { type: tokenTypeName })}
              </Button>
            </Bottom>
          </Column>
        </Columns>
      </Form>
    </FormikProvider>
  );
};

export default ConfirmTokenCreationModal;
