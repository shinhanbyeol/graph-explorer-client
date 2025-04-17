import React, { useEffect } from 'react';
import { Main } from '../layout/Main/Main';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react';
import CodeEditor from '../components/features/CodeEditor';
import Result from '../components/features/Result';
import useGraphology from '../hooks/useGraphology';
import { useGraphologyStore } from '../stores';
import { useWorkspaceStore } from '../stores/workspaceStore';

function WorkspacePage() {
  const router = useRouter();
  const { setWorkspace, setWorkspaceJsonPath, setWorkspaceSqlPath } =
    useWorkspaceStore();
  const {
    serverId,
    serverName,
    graph,
    sessionId,
    workspaceName,
    workspaceSqlPath,
    workspaceJsonPath,
    workspaceResultPath,
  } = router.query;

  // graphology hook
  const { init } = useGraphology();
  const { lastExecutedTime, setLastInitTime } = useGraphologyStore();

  // initialize the graphology
  useEffect(() => {
    init(workspaceName as string, graph as string, Number(serverId));
    setWorkspace(workspaceName as string);
    setWorkspaceJsonPath(workspaceJsonPath as string);
    setWorkspaceSqlPath(workspaceSqlPath as string);
    setLastInitTime(Date.now());
  }, [
    serverId,
    serverName,
    graph,
    sessionId,
    workspaceName,
    workspaceSqlPath,
    workspaceJsonPath,
  ]);

  useEffect(() => {}, [lastExecutedTime]);

  return !serverId ||
    !graph ||
    !sessionId ||
    !workspaceName ||
    !workspaceSqlPath ||
    !workspaceJsonPath ||
    !workspaceResultPath ? (
    <React.Fragment>
      <Head>
        <title>Graph Explorer Client</title>
      </Head>
      <Main>
        <Stack h={'100%'} direction={'column'}>
          <Progress size="xs" isIndeterminate colorScheme={'black'} />
        </Stack>
      </Main>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <Head>
        <title>Graph Explorer Client</title>
      </Head>
      <Main>
        <Stack h={'100%'} direction={'column'}>
          <Breadcrumb
            backgroundColor={'black'}
            color={'white'}
            paddingLeft={'1rem'}
          >
            <BreadcrumbItem>
              <Text fontSize={'sm'}>{serverName}</Text>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Text fontSize={'sm'}>{graph}</Text>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Text fontSize={'sm'}>{workspaceName}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
          <Box position={'relative'} display={'block'} flex={1}>
            <Result workspaceResultPath={workspaceResultPath as string} />
            <CodeEditor
              workspaceSqlPath={workspaceSqlPath as string}
              sessionId={sessionId as string}
              graph={graph as string}
            />
          </Box>
        </Stack>
      </Main>
    </React.Fragment>
  );
}

export default WorkspacePage;
