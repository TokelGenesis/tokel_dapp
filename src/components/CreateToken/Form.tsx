import React from 'react';

import styled from '@emotion/styled';
import { Form, FormikProvider, useFormik } from 'formik';

import Caret from 'assets/Caret.svg';
import useMyCollections from 'hooks/useMyCollections';
import usePrevious from 'hooks/usePrevious';
import { useT } from 'i18n';
import { dispatch } from 'store/rematch';
import { TokenForm } from 'util/token-types';
import TokenType from 'util/types/TokenType';
import useTokenCreationSchema from 'util/validators/useTokenCreationSchema';
import { HIDE_IPFS_EXPLAINER_KEY, ModalName } from 'vars/defines';

import Checkbox from 'components/_General/_FormikElements/Checkbox';
import Field from 'components/_General/_FormikElements/Field';
import MultiKeyValue from 'components/_General/_FormikElements/MultiKeyValue';
import Select, { SelectOption } from 'components/_General/_FormikElements/Select';
import { Button } from 'components/_General/buttons';
import { Column, Columns } from 'components/_General/Grid';

interface CreateTokenFormProps {
  tokenType: TokenType;
}

const CaretContainer = styled.button<{ open: boolean }>`
  width: max-content;
  padding: 2px 0;
  border: none;
  background: transparent;
  color: var(--tg-text);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  /* the icon file is white, so it is used as a mask and takes the text colour in both themes */
  .caret {
    width: 9px;
    height: 5px;
    margin-left: 6px;
    background: currentColor;
    mask: url('${Caret}') center / contain no-repeat;
    ${({ open }) => (open ? '' : 'transform: rotate(-90deg)')};
    transition: transform 0.15s ease;
  }
`;

const Bottom = styled(Columns)`
  position: sticky;
  background-color: var(--tg-surface);
  border-top: 1px solid var(--tg-separator);
  bottom: 0;
  margin-top: auto;

  ${Column} {
    display: flex;
    width: 100%;
    align-items: center;
  }

  button {
    margin-left: auto;
    margin-right: 5px;
  }
`;

const FormStyled = styled(Form)`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;

const initialValues: Partial<TokenForm> = {
  name: '',
  description: '',
  url: '',
  royalty: 0,
  supply: '',
  id: null,
  confirmation: false,
  arbitraryAsJson: {
    collection_name: '',
    number_in_collection: '',
  },
  arbitraryAsJsonUnformatted: [],
};

const CreateTokenForm: React.FC<CreateTokenFormProps> = ({ tokenType }) => {
  const t = useT();
  const tokenTypeDisplay = tokenType === TokenType.NFT ? t('tok.nft') : t('tok.token');
  const ty = { type: tokenTypeDisplay };
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [shownIpfsNotice, setShownIpfsNotice] = React.useState(false);
  const tokenCreationSchema = useTokenCreationSchema();

  const formikBag = useFormik<Partial<TokenForm>>({
    validationSchema: tokenCreationSchema,
    initialValues,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(false);
      dispatch.environment.SET_MODAL({
        name: ModalName.CONFIRM_TOKEN_CREATION,
        options: { ...values, confirmation: false },
      });
    },
  });

  const { setValues, values, submitForm, isSubmitting, isValid, setFieldValue } = formikBag;

  const previousTokenType = usePrevious(tokenType);
  const previousValues = usePrevious(values);
  const myCollections = useMyCollections();

  const handleMediaFieldFocus = () => {
    if (localStorage.getItem(HIDE_IPFS_EXPLAINER_KEY) || shownIpfsNotice) return;

    dispatch.environment.SET_MODAL({
      name: ModalName.IPFS_EXPLAINER,
    });

    setShownIpfsNotice(true);
  };

  React.useEffect(() => {
    setShownIpfsNotice(false);
  }, [tokenType]);

  React.useEffect(() => {
    // Persist only name, description, url and royalty if changing between fungible and NFT
    if (previousTokenType !== tokenType)
      setValues(
        {
          ...initialValues,
          name: values.name,
          description: values.description,
          url: values.url,
          royalty: values.royalty,
          supply: tokenType === TokenType.NFT ? 1 : '',
        },
        true
      );
  }, [tokenType, previousTokenType, setValues, values]);

  // If collection changes, format received ReactSelect option and set ID
  React.useEffect(() => {
    const collectionOption = values.arbitraryAsJson?.collection_name as SelectOption;
    if (typeof collectionOption === 'object') {
      /* eslint no-underscore-dangle: 0 */
      if (collectionOption.__isNew__) {
        setFieldValue('id', Math.floor(Math.random() * 999999));
      } else {
        setFieldValue('id', collectionOption?.value);
      }

      setFieldValue('arbitraryAsJson[collection_name]', collectionOption?.label);
    } else if (collectionOption === undefined) {
      setFieldValue('id', '');
    }
  }, [values.arbitraryAsJson.collection_name, setFieldValue]);

  // If ID changes manually, set collection
  React.useEffect(() => {
    if (
      values?.id !== previousValues?.id &&
      values?.arbitraryAsJson?.collection_name === previousValues?.arbitraryAsJson?.collection_name
    ) {
      setFieldValue('arbitraryAsJson[collection_name]', myCollections[values.id]?.label || '');
    }
  }, [myCollections, values, previousValues, setFieldValue]);

  const formattedSelectedCollectionOption = typeof values.arbitraryAsJson.collection_name ===
    'string' &&
    Boolean(values.arbitraryAsJson.collection_name?.length) && {
      label: values.arbitraryAsJson.collection_name as string,
      value: values.id,
    };

  return (
    <FormikProvider value={formikBag}>
      <FormStyled>
        <Columns>
          <Column size={6}>
            <Field
              name="name"
              type="text"
              label={t('tok.name', ty)}
              placeholder={t('tok.namePh', ty)}
              help={t('tok.nameHelp', ty)}
            />

            <Field
              name="description"
              type="textarea"
              label={t('tok.desc')}
              placeholder={t('tok.descPh', ty)}
              help={t('tok.descHelp', ty)}
            />

            <Field
              name="supply"
              type="number"
              label={t('tok.supply')}
              readOnly={tokenType === TokenType.NFT}
              placeholder="100,000"
              min={1}
              help={t('tok.supplyHelp')}
            />

            <Field
              name="url"
              type="text"
              label={t('tok.url')}
              placeholder={t('tok.urlPh', ty)}
              help={t('tok.urlHelp', ty)}
              onFocus={handleMediaFieldFocus}
            />

            <Field
              name="royalty"
              type="number"
              label={t('tok.royalty')}
              placeholder="0"
              help={t('tok.royaltyHelp', ty)}
              append="%"
            />

            <CaretContainer
              type="button"
              open={showAdvanced}
              aria-expanded={showAdvanced}
              data-tid="token-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {t('tok.advanced')} <span className="caret" aria-hidden />
            </CaretContainer>

            {showAdvanced && (
              <Field
                name="id"
                type="number"
                label={t('tok.id')}
                placeholder={t('tok.idPh')}
                help={t('tok.idHelp', ty)}
              />
            )}
          </Column>
          <Column size={6}>
            {tokenType === TokenType.NFT && (
              <>
                <Select
                  name="arbitraryAsJson[collection_name]"
                  label={t('tok.collection')}
                  placeholder={t('tok.collectionPh')}
                  help={t('tok.collectionHelp')}
                  options={Object.values(myCollections)}
                  formattedSelectedOption={formattedSelectedCollectionOption}
                  creatable
                />
                <Field
                  name="arbitraryAsJson[number_in_collection]"
                  type="number"
                  label={t('tok.number')}
                  min={1}
                  placeholder="N/A"
                  help={t('tok.numberHelp')}
                />
              </>
            )}

            <MultiKeyValue
              name="arbitraryAsJsonUnformatted"
              label={t('tok.attrs')}
              help={t('tok.attrsHelp', ty)}
            />
          </Column>
        </Columns>

        <Bottom>
          <Column size={12}>
            <Checkbox name="confirmation" label={t('tok.checked')} />
            <Button
              onClick={submitForm}
              theme="purple"
              disabled={isSubmitting || !isValid}
              data-tid="submit-token"
            >
              {t('tok.continue')}
            </Button>
          </Column>
        </Bottom>
      </FormStyled>
    </FormikProvider>
  );
};

export default CreateTokenForm;
