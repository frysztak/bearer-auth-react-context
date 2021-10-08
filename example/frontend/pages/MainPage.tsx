import { useCallback } from 'react';
import * as React from 'react';
import {
  Button,
  Divider,
  Heading,
  List,
  ListItem,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useGetPetsPet } from '../api/pets';
import { ApiError } from '../api/common';
import { useUsersQuery } from '../api/users';
import { getErrorMessage } from '../api/helpers';

export const MainPage: React.FC = () => {
  const toast = useToast();
  const petQuery = useGetPetsPet({
    onError: (error: ApiError) => {
      toast({
        status: 'error',
        position: 'bottom-left',
        title: 'Error',
        description: getErrorMessage(error),
        isClosable: true,
      });
    },
  });

  const usersQuery = useUsersQuery({
    onError: (error: ApiError) => {
      toast({
        status: 'error',
        position: 'bottom-left',
        title: 'Error',
        description: getErrorMessage(error),
        isClosable: true,
      });
    },
  });

  const refetchAll = useCallback(() => {
    petQuery.refetch();
    usersQuery.refetch();
  }, [petQuery, usersQuery]);

  return (
    <VStack>
      <Heading>Pet</Heading>
      <Button
        onClick={() => petQuery.refetch()}
        isLoading={petQuery.isLoading || petQuery.isFetching}
      >
        Get pet
      </Button>
      {petQuery.isSuccess && (
        <>
          Name: {petQuery.data.name}
          <br />
          ID: {petQuery.data.id}
        </>
      )}

      <Divider />

      <Heading>Users</Heading>
      <Button
        onClick={() => usersQuery.refetch()}
        isLoading={usersQuery.isLoading || usersQuery.isFetching}
      >
        Get users
      </Button>
      {usersQuery.isSuccess && (
        <List>
          {usersQuery.data.map((user) => (
            <ListItem key={user.id}>
              Name: {user.firstName} {user.lastName}
              <br />
              ID: {user.id}
            </ListItem>
          ))}
        </List>
      )}

      <Divider />

      <Button
        onClick={refetchAll}
        isLoading={
          petQuery.isLoading ||
          petQuery.isFetching ||
          usersQuery.isLoading ||
          usersQuery.isFetching
        }
      >
        Refetch all
      </Button>
    </VStack>
  );
};
