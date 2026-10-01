import React from 'react';
import { FieldHookConfig, FieldArray, useField, Field } from 'formik';
import { Button } from 'components/_General/buttons';
import { Columns, Column } from 'components/_General/Grid';
import styled from '@emotion/styled';

import { useT } from 'i18n';
import { Colors } from 'vars/defines';
import Icon from 'components/_General/_UIElements/Icon';
import PlusIcon from 'assets/Plus.svg';
import MinusIcon from 'assets/Minus.svg';
import { inputStyles } from './common';

import FieldContainer from './FieldContainer';

const Input = styled(Field)`
  ${inputStyles}
`;

const CustomPaddingColumn = styled(Column)`
  padding-right: 0;
  padding-bottom: 0.15em;
`;

interface MultiKeyValueProps {
  label?: string;
  help?: string;
}

const MultiKeyValue: React.FC<MultiKeyValueProps & FieldHookConfig<string>> = ({
  label,
  help,
  ...props
}) => {
  const t = useT();
  const [field, meta] = useField(props);

  return (
    <FieldContainer label={label} help={help} {...props}>
      <FieldArray
        name={props.name}
        render={({ push, remove }) => {
          const errors = meta.error as unknown as Array<{ key?: string; value?: string }>;
          return (
            <div>
              {(field.value as unknown as Array<unknown>)?.map((_v, index) => (
                // TODO can I use an id here instead?
                // eslint-disable-next-line react/no-array-index-key
                <Columns mobile key={index}>
                  <CustomPaddingColumn size={5}>
                    <Input
                      name={`${props.name}.${index}.key`}
                      placeholder={t('tok.attrKey')}
                      type="text"
                    />
                    {Boolean(errors?.[index]?.key) && (
                      <div className="error">{errors?.[index]?.key}</div>
                    )}
                  </CustomPaddingColumn>
                  <CustomPaddingColumn size={5}>
                    <Input
                      name={`${props.name}.${index}.value`}
                      placeholder={t('tok.attrValue')}
                      type="text"
                    />
                    {Boolean(errors?.[index]?.value) && (
                      <div className="error">{errors?.[index]?.value}</div>
                    )}
                  </CustomPaddingColumn>
                  <CustomPaddingColumn size={2}>
                    <Button
                      type="button"
                      theme={Colors.BLACK}
                      aria-label="Remove"
                      customWidth="36px"
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      <Icon icon={MinusIcon} color="frontSoft" width={16} height={16} centered />
                    </Button>
                  </CustomPaddingColumn>
                </Columns>
              ))}
              <Button
                type="button"
                theme={Colors.BLACK}
                customWidth="auto"
                onClick={() => push({ key: '', value: '' })}
                hasIcon
              >
                <Icon icon={PlusIcon} color="frontSoft" width={16} height={16} />
                {t('tok.attrAdd')}
              </Button>
            </div>
          );
        }}
      />
    </FieldContainer>
  );
};

export default MultiKeyValue;
