import { Box, Button, Container, Stack } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';

// Styles
import Styles from './Workspace.module.scss';
import FormModal from '../../design/FormModal';
import { useRouter } from 'next/router';

interface WorkspaceProps {
  server: ServerResponse;
  graph: string;
  sessionId: string;
}

const Workspace = ({ server, graph, sessionId }: WorkspaceProps) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [clickedWorkspace, setClickedWorkspace] = useState<number | null>();
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] =
    useState<() => void>();
  const router = useRouter();

  const handleWorkspaceDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (clickedWorkspace !== null) {
      router.push({
        pathname: '/workspace',
        query: {
          serverId: server.id,
          serverName: server.name,
          graph: graph,
          sessionId: sessionId,
          workspaceName: workspaces[clickedWorkspace].name,
          workspaceSqlPath: workspaces[clickedWorkspace].sqlPath,
          workspaceJsonPath: workspaces[clickedWorkspace].jsonPath,
          workspaceResultPath: workspaces[clickedWorkspace].resultPath,
        },
      });
    }
  };

  const handleRefreshWorkspaces = () => {
    window.ipc
      .invoke('getWorkspaces', {
        serverId: server.id,
        graph: graph,
      })
      .then((res: IPCResponse<WorkspaceResponse[]>) => {
        setWorkspaces(res?.data?.map((ws) => ws));
      });
  };

  const handleNewWorkspace = (values) => {
    window.ipc
      .invoke('createWorkspace', {
        serverId: server.id,
        graph: graph,
        name: values.workspaceName,
      })
      .then((res: IPCResponse<null>) => {
        handleRefreshWorkspaces();
      });
  };

  const openNewWorkspaceForm = () => {
    showNewWorkspaceModal();
  };

  useEffect(() => {
    handleRefreshWorkspaces();
  }, []);

  return (
    <Stack direction={'column'} gap={0}>
      <FormModal
        initialValues={{ workspaceName: '' }}
        cancelText="Cancel"
        confirmText="Create page"
        onCloseEvent={() => {}}
        onSubmit={handleNewWorkspace}
        title="Create new page"
        wakeupFormModal={(wakeupFunction) => {
          setShowNewWorkspaceModal(() => wakeupFunction);
        }}
      />
      <Container p={0} pl={12}>
        {workspaces.map((workspace, index) => {
          return (
            <Box
              key={`ws-${index}`}
              w={'100%'}
              bgColor={clickedWorkspace === index ? 'black.alpha.10' : ''}
              color={clickedWorkspace === index ? 'black' : ''}
            >
              <a
                className={`${Styles.WorkspaceItem}`}
                onClick={(e) => {
                  e.preventDefault();
                  setClickedWorkspace(index);
                }}
                onDoubleClick={handleWorkspaceDoubleClick}
              >
                {clickedWorkspace === index}
                {workspace.name}
              </a>
            </Box>
          );
        })}
      </Container>
      <Container>
        <Button
          h={'1.5rem'}
          width={'100%'}
          ml={'1.5rem'}
          justifyContent={'flex-start'}
          onClick={openNewWorkspaceForm}
          fontSize={'sm'}
        >
          + New page
        </Button>
      </Container>
    </Stack>
  );
};

export default memo(Workspace);
