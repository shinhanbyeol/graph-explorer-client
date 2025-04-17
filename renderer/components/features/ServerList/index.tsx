import React from 'react';
import Styels from './ServerList.module.scss';

import { Accordion } from '@chakra-ui/react';
import Server from '../ServerItem';

interface ServerListProps {
  servers: ServerResponse[];
}

const ServerList = ({ servers }: ServerListProps) => {
  return (
    <div className={Styels.Root}>
      <Accordion allowMultiple>
        {servers.map((server) => (
          <Server key={server.id} server={server} />
        ))}
      </Accordion>
    </div>
  );
};

export default ServerList;
