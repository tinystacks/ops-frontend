import React from 'react';
import { Box, HStack, Link, Stack, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Dashboard } from '@tinystacks/ops-model';

export function DashboardCard(props: { dashboard: Dashboard }) {
  const { dashboard } = props;
  return (
    <Box
      as='section'
      bg={useColorModeValue('gray.100', 'inherit')}
      id={`stack-card-${dashboard.id}`}
    >
      <Box maxW={{ base: 'xl', md: '7xl' }} mx='auto'>
        <Box
          rounded='lg'
          bg={useColorModeValue('white', 'gray.700')}
          maxW='3xl'
          mx='auto'
          shadow='base'
          overflow='hidden'
          h='200px'
          w='300px'
        >
          <Stack justify='space-between' height='100%'>
            <Stack spacing='5px' h='full' px='6' py='4'>
              <HStack justify='space-between'>
                <Link href={`dashboards/${dashboard.route}`}>
                  <Tooltip label={dashboard.id}>
                    <Text
                      noOfLines={1}
                      fontWeight='bold'
                      fontSize='lg'
                      maxW='200px'
                    >
                      {dashboard.id}
                    </Text>
                  </Tooltip>
                  <Text>
                    {/* TODO: Add to model */}
                    {/* {dashboard.description} */}
                  </Text>
                </Link>
              </HStack>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
