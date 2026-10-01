import React from 'react';

import styled from '@emotion/styled';

import PrivateKeyForm from './PrivateKeyForm';

const PrivKeyLoginRoot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
`;

const PrivKeyLogin = () => {
  return (
    <PrivKeyLoginRoot>
      <PrivateKeyForm />
    </PrivKeyLoginRoot>
  );
};

export default PrivKeyLogin;
