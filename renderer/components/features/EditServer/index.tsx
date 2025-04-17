import React from 'react';

import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Radio,
  RadioGroup,
  Stack,
  Select,
} from '@chakra-ui/react';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import { AGE_FLAVOR } from '../../../utils/enum';

const EditServerModal = ({
  onClose,
  server,
}: {
  onClose: () => void;
  server: ServerResponse;
}) => {
  const ageVersions = ['1.5.0', '1.4.0'];
  const agensGraphVersions = ['2.14', '2.13'];
  /**
   * @description Handle add new server
   * @param values
   * @param actions
   */
  const handleEditServer = async (
    values: {
      name: string;
      serverType: string;
      version: string;
      host: string;
      port: string;
      username: string;
      password: string;
      database: string;
    },
    actions: FormikHelpers<{
      name: string;
      serverType: string;
      version: string;
      host: string;
      port: string;
      username: string;
      password: string;
      database: string;
    }>,
  ) => {
    const editSeverSuccess: IPCResponse<null> = await window.ipc.invoke(
      'updateServer',
      {
        id: String(server.id),
        name: String(values.name),
        host: String(values.host),
        port: String(values.port),
        database: String(values.database),
        user: String(values.username),
        password: String(values.password),
        serverType: String(values.serverType) as AGE_FLAVOR,
        version: String(values.version),
      },
    );
    if (editSeverSuccess.error) {
      actions.setFieldError('name', 'Failed to add new server');
    }
    return true;
  };

  return (
    <Formik
      initialValues={{
        serverType: String(server.serverType),
        version: String(server.version),
        name: String(server.name),
        host: String(server.host),
        port: String(server.port),
        database: String(server.database),
        username: String(server.user),
        password: String(server.password),
      }}
      onSubmit={async (values, actions) => {
        const edit = await handleEditServer(values, actions);
        if (!edit) {
          actions.setSubmitting(false);
          return;
        }
        const refresRequest = new CustomEvent('agv:event:serverlist:refresh');
        window.dispatchEvent(refresRequest);
        actions.setSubmitting(false);
        onClose();
      }}
    >
      {(props) => (
        <Form>
          <ModalContent>
            <ModalHeader>Add new server</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Container display={'flex'} flexDirection={'column'} rowGap={2}>
                <Field name="serverType" placeholder="Server Type">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="serverType" width={110}>
                          Type
                        </FormLabel>
                        <RadioGroup
                          defaultValue="AGE"
                          name="serverType"
                          value={props.values.serverType}
                        >
                          <Stack spacing={8} direction="row">
                            <Radio
                              id="serverType"
                              colorScheme="red"
                              value={AGE_FLAVOR.AGE}
                              onChange={(e) => {
                                props.setFieldValue('version', '1.5.0');
                                props.handleChange(e);
                              }}
                            >
                              AGE
                            </Radio>
                            <Radio
                              id="serverType"
                              colorScheme="blue"
                              value={AGE_FLAVOR.AGENSGRAPH}
                              onChange={(e) => {
                                props.setFieldValue('version', '2.14');
                                props.handleChange(e);
                              }}
                            >
                              AgensGraph
                            </Radio>
                          </Stack>
                        </RadioGroup>
                        <FormErrorMessage>
                          {form?.errors?.serverType}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="version" value={props.values.serverType === 'AGE'}>
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="version" width={110}>
                          Version
                        </FormLabel>
                        <Select
                          title="Version"
                          name="version"
                          value={props.values.version}
                          onChange={props.handleChange}
                        >
                          {props.values.serverType === 'AGE' ? (
                            <>
                              {ageVersions.map((version) => (
                                <option key={version} value={version}>
                                  {version}
                                </option>
                              ))}
                            </>
                          ) : (
                            <>
                              {agensGraphVersions.map((version) => (
                                <option key={version} value={version}>
                                  {version}
                                </option>
                              ))}
                            </>
                          )}
                        </Select>
                        <FormErrorMessage>
                          {form?.errors?.version}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="name" placeholder="Name">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="name" width={110}>
                          Name
                        </FormLabel>
                        <Input
                          {...field}
                          id="name"
                          value={props.values.name}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.name}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="host" placeholder="Host">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="host" width={110}>
                          Host
                        </FormLabel>
                        <Input
                          {...field}
                          id="host"
                          value={props.values.host}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.host}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="port" placeholder="Port">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="port" width={110}>
                          Port
                        </FormLabel>
                        <Input
                          {...field}
                          id="port"
                          value={props.values.port}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.port}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="database" placeholder="Database">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="database" width={110}>
                          Database
                        </FormLabel>
                        <Input
                          {...field}
                          id="database"
                          value={props.values.database}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.database}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="username" placeholder="Username">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="username" width={110}>
                          Username
                        </FormLabel>
                        <Input
                          {...field}
                          id="username"
                          value={props.values.username}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.username}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="password" placeholder="Password">
                  {(field, form) => {
                    return (
                      <FormControl display={'flex'} alignItems={'row'}>
                        <FormLabel htmlFor="password" width={110}>
                          Password
                        </FormLabel>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          value={props.values.password}
                          onChange={props.handleChange}
                        />
                        <FormErrorMessage>
                          {form?.errors?.password}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
              </Container>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant="submit"
                type="submit"
                isLoading={props.isSubmitting}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Form>
      )}
    </Formik>
  );
};

export default EditServerModal;
