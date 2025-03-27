import { Box } from '@chakra-ui/react';
import { SearchControl, ZoomControl } from '@react-sigma/core';
import Styles from '../Result.module.scss';
import { text } from 'stream/consumers';

const Control = () => {
  return (
    <>
      <Box className={Styles.ControlLeft}>
        <ZoomControl />
      </Box>
      <Box className={Styles.ControlRight}>
        <SearchControl />
      </Box>
    </>
  );
};

export default Control;
