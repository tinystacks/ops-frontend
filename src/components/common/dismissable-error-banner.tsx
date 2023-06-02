import {
  Alert,
  Container,
  Center,
  Flex,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';

type DismissableErrorBannerProps = {
  error: {
    title: string;
    message: string;
  },
  dismissError: () => void;
};

export default function DismissableErrorBanner (props: DismissableErrorBannerProps) {
  const {
    error: {
      title,
      message
    },
    dismissError
  } = props;

  return (
    <Alert status='error' alignContent='center' w='auto'>
      <Container maxW="7xl">
        <Center>
          <Flex>
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
    </Alert>
  );
}