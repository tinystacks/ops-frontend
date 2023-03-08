import React from 'react';
import logo from 'ops-frontend/img/logo.png';
import { Image, HStack, Heading } from '@chakra-ui/react';

export const Logo = ({
  height,
}: {
  height?: string;
}) => {

  return (
    <HStack align='center'>
      <Image
        src={logo.src}
        alt='OpsConsole'
        height={height || '32px'}
        width='auto'
      ></Image>
      <Heading size='md' textColor='white' fontWeight='500'>OpsConsole</Heading>
    </HStack>
  );
};