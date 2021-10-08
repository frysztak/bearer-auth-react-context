import * as React from 'react';
import {
  AuthenticateResponse,
  useUsersAuthenticateMutation,
} from '../api/users';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { useBearerAuthContext } from '../../src';
import { getErrorMessage } from '../api/helpers';
import { ApiError } from '../api/common';

function validateUsername(value) {
  return !!value ? undefined : 'Username is required.';
}

function validatePassword(value) {
  return !!value ? undefined : 'Password is required.';
}

export const LoginPage: React.FC = (props) => {
  const bearerAuthContext = useBearerAuthContext();
  const toast = useToast();

  const { isLoading, mutate } = useUsersAuthenticateMutation({
    onSuccess: (data: AuthenticateResponse) => {
      console.log({ data });
      bearerAuthContext.setTokens({
        bearerToken: data.jwtToken,
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        status: 'error',
        position: 'bottom-left',
        isClosable: true,
      });
    },
  });

  return (
    <VStack w="full">
      <Heading>Login</Heading>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values, actions) => {
          mutate(values);
        }}
      >
        {(props) => (
          <Form>
            <Field name="username" validate={validateUsername}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.username && form.touched.username}
                >
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input {...field} id="username" placeholder="Username" />
                  <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="password" validate={validatePassword}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.password && form.touched.password}
                >
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    {...field}
                    id="password"
                    placeholder="Password"
                    type="password"
                  />
                  <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isLoading}
              type="submit"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </VStack>
  );
};
