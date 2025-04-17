import React, { memo, useCallback, useEffect, useState } from 'react';

// styles
import Styels from './HomeBar.module.scss';
import {
  Button,
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import AddServer from '../../features/AddServer';
import ServerList from '../../features/ServerList';
import { PiDatabaseFill } from 'react-icons/pi';

interface HomeBarProps {
  visible: boolean;
}

const HomeBar = ({ visible }: HomeBarProps) => {
  const [servers, setServers] = useState<ServerResponse[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const refreshServers = useCallback(() => {
    window.ipc
      .invoke('getServers', null)
      .then((res: IPCResponse<ServerResponse[]>) => {
        if (res?.success) {
          setServers(res.data);
        } else {
          alert(res.message);
        }
      });
  }, []);

  const handleModalOpen = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault;
    onOpen();
  };

  // on mount
  useEffect(() => {
    refreshServers();
    window.addEventListener('agv:event:serverlist:refresh', refreshServers);
    // on unmount
    return () => {
      window.removeEventListener(
        'agv:event:serverlist:refresh',
        refreshServers,
      );
    };
  }, [refreshServers]);

  return (
    <div
      className={Styels.Root}
      style={{
        display: visible ? '' : 'none',
      }}
    >
      <Heading
        fontSize="medium"
        fontWeight="bold"
        display={'flex'}
        flexDir={'column'}
        alignItems={'center'}
        justifyContent={'space-between'}
        pt={'0.5rem'}
        pl={'1rem'}
        pr={'1rem'}
        mt={'1rem'}
        gap={2}
      >
        <Text fontWeight={'bold'} fontSize={'lg'}>
          Database Explorer
        </Text>
        <Button
          size={'sm'}
          variant={'outline'}
          leftIcon={<Icon as={PiDatabaseFill} />}
          aria-label="Add database"
          title="Add database"
          onClick={handleModalOpen}
        >
          Add Database
        </Button>
      </Heading>
      <Modal isOpen={isOpen} onClose={() => onClose()}>
        <ModalOverlay />
        {isOpen && <AddServer onClose={onClose} />}
      </Modal>
      <ServerList servers={servers} />
    </div>
  );
};

export default memo(HomeBar);
