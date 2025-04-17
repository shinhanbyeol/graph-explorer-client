import { memo, useState } from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  Text,
  MenuList,
  Menu,
  MenuItem,
  Modal,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import ServerPanel from './ServerPanel';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { PiDatabaseFill } from 'react-icons/pi';
import { ContextMenu } from 'chakra-ui-contextmenu';
import EditServerModal from '../EditServer';
import AlertDialogBox from '../../design/AlertDialog';

interface ServerProps {
  server: ServerResponse;
}

const Server = ({ server }: ServerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [removeAlert, setRemoveAlert] = useState<() => void>(() => () => {});

  /**
   * @description Delete server
   */
  const handleDeleteServer = () => {
    window.ipc
      .invoke('removeServer', server.id)
      .then((res: IPCResponse<null>) => {
        if (res?.success) {
          alert('Server removed');
          window.dispatchEvent(new Event('agv:event:serverlist:refresh'));
        } else {
          alert(res.message);
        }
      });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => onClose()}>
        <ModalOverlay />
        {isOpen && <EditServerModal server={server} onClose={onClose} />}
      </Modal>
      <AlertDialogBox
        title="Are you sure remove server"
        message="this action is imposible redo"
        onConfirm={handleDeleteServer}
        onCancel={function (): void {}}
        confirmText={'Delete'}
        cancelText={'Cancel'}
        wakeupAlertDialog={function (wakeupFunction: () => void): void {
          setRemoveAlert(() => wakeupFunction);
        }}
      />
      <AccordionItem border={'none'}>
        {({ isExpanded }) => (
          <>
            <ContextMenu<HTMLDivElement>
              renderMenu={() => {
                return (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        onOpen();
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => removeAlert()}>Delete</MenuItem>
                    <MenuItem onClick={() => alert('todo work')}>
                      Disconnect
                    </MenuItem>
                  </MenuList>
                );
              }}
            >
              {(ref) => (
                <h3 ref={ref}>
                  <AccordionButton
                    as={Button}
                    variant={'item'}
                    h={'1.5em'}
                    justifyContent={'space-between'}
                    leftIcon={
                      <>
                        <Text ml={2}>{server.name}</Text>
                      </>
                    }
                    rightIcon={
                      isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
                    }
                  ></AccordionButton>
                </h3>
              )}
            </ContextMenu>
            {isExpanded && (
              <AccordionPanel p={0}>
                <ServerPanel server={server} onOpen={onOpen}/>
              </AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </>
  );
};

export default memo(Server);
