import React from 'react';
import { Box, HStack, Link, Stack, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Page } from '@tinystacks/ops-model';

export const DashboardCard = (page: Page) => {
    return (
      <Box
        as='section'
        bg={useColorModeValue('gray.100', 'inherit')}
        id={`stack-card-${page.id}`}
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
                  <Link href={page.route}>
                    <Tooltip label={page.id}>
                      <Text
                        noOfLines={1}
                        fontWeight='bold'
                        fontSize='lg'
                        maxW='200px'
                      >
                        {page.id}
                      </Text>
                    </Tooltip>
                  </Link>
                </HStack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    )
  }
