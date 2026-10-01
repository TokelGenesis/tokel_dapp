import React from 'react';
import { useSelector } from 'react-redux';

import { toSatoshi } from 'satoshi-bitcoin';
import * as yup from 'yup';

import { useT } from 'i18n';
import { selectUnspentBalance } from 'store/selectors';
import { EXTRACT_IPFS_HASH_REGEX, FEE, RESERVED_TOKEL_ARBITRARY_KEYS, TICKER } from 'vars/defines';

const useTokenCreationSchema = () => {
  const t = useT();
  const balance = useSelector(selectUnspentBalance);
  const maxSupply = React.useMemo(() => toSatoshi(balance) - toSatoshi(FEE), [balance]);

  const schema = React.useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .max(32, t('val.max', { n: 32 }))
          .required(t('val.required')),
        description: yup
          .string()
          .max(4096, t('val.max', { n: 4096 }))
          .required(t('val.required')),
        supply: yup
          .number()
          .required()
          .positive()
          .integer()
          .max(maxSupply, t('val.notEnough', { ticker: TICKER })),
        url: yup.lazy(val =>
          val?.match(EXTRACT_IPFS_HASH_REGEX)
            ? yup.string().matches(EXTRACT_IPFS_HASH_REGEX, t('val.url'))
            : yup.string().url(t('val.url'))
        ),
        royalty: yup
          .number()
          .positive()
          .min(0)
          .max(99.9)
          .test(
            'one-decimal',
            t('val.oneDecimal'),
            value => !value || Number.isInteger(value * 10)
          ),
        id: yup
          .number()
          .positive()
          .integer()
          .max(999999, t('val.idMax'))
          .nullable()
          .test('only-numbers', t('val.id'), value => !value || /^[0-9]*$/.test(value?.toString())),

        confirmation: yup.boolean().oneOf([true], ''),

        dataAsJson: yup.object().shape({
          collection_name: yup.string().max(32),
          number_in_collection: yup.number().min(1),
        }),

        arbitraryAsJsonUnformatted: yup.array().of(
          yup.object().shape({
            key: yup
              .string()
              .required(t('val.required'))
              .notOneOf(RESERVED_TOKEL_ARBITRARY_KEYS, t('val.badKey')),
            value: yup.string().required(t('val.required')),
          })
        ),
      }),
    [maxSupply, t]
  );

  return schema;
};

export default useTokenCreationSchema;
