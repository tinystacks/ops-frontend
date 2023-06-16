import {
  Alert,
  Box,
  Container,
  Center,
  Flex,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Text
} from '@chakra-ui/react';
import upperFirst from 'lodash.upperfirst';
import { ShowableError } from '../../types.js';

type DismissableErrorBannerProps = {
  error: ShowableError,
  dismissError: () => void;
};

export default function DismissableErrorBanner (props: DismissableErrorBannerProps) {
  const {
    error: {
      title,
      message,
      cause,
      context,
      fields = {}
    },
    dismissError
  } = props;

  let extraDetail;
  if (cause || context) {
    const punctuationCheck = new RegExp('.*[,.?!;:=-]');
    let causePunctuation; 
    if (cause) {
      causePunctuation =  punctuationCheck.test(cause) ? '' :
        (
          context ? ':' : '.'
        );
    }
    extraDetail = (
      <Box display='block' alignContent='start'>
        <Text>
          {`${upperFirst(cause)}${causePunctuation}`}
        </Text>
        <Text whiteSpace='pre' textAlign='left' fontFamily='monospace'>
          {
            context ? context :
            Object.entries(fields).map(([property, propError]) => {
              return `${property} - ${propError}`
            }).join('\n')
          }
        </Text>
      </Box>
    )
  }

  return (
    <Alert
      status='error'
      w='auto'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
    >
      <Container maxW="7xl">
        <Center>
          <Flex alignContent='space-between'>
            <AlertIcon
              alignSelf='center'
              position='relative'
              right={-1}
              top={-1}
            />
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            <CloseButton
              onClick={dismissError}
              alignSelf='flex-end'
              position='relative'
              right={-1}
              top={-1}
            />
          </Flex>
        </Center>
      </Container>
      {extraDetail}
    </Alert>
  );
}