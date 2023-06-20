import { ModalBody, Spinner } from '@chakra-ui/react';
import React from 'react';

export default function DynamicModalBody(props: { body: JSX.Element[], loading: boolean, error?: string }) {
  const { body, loading, error } = props;
  const errorView = 'ERROR!';

  const mb = loading ? <Spinner/>
    : error ? errorView
    : body;

  return (<ModalBody>{mb}</ModalBody>);
}