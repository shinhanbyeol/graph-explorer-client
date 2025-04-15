import React, { use, useEffect, useMemo } from 'react';
import { Main } from '../layout/Main/Main';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
    workspaceJsonPath
  } = router.query;

  // const resultTabs = useMemo(() => {
  //   console.log(
  //     '🚀 ~ file: workspace.tsx:21 ~ WorkspacePage ~ resultTabs:',
  //     `${1}`,
  //   )
  // }, [serverId, graph, workspaceJsonPath]);

  // Check if the query is not null else return an error message
  if (
    !serverId ||
    !graph ||
    !sessionId ||
    !workspaceName ||
    !workspaceSqlPath ||
    !workspaceJsonPath
  ) {
    return (
      <React.Fragment>
        <Head>
          <title>Graph Explorer Client</title>
        </Head>
        <Main>
          <Text fontSize={'4xl'}>Sorry!! something went wrong</Text>
        </Main>
      </React.Fragment>
    );
  }

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

  return (
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
            <BreadcrumbItem>
              <Text fontSize={'sm'}>{lastExecutedTime}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
          <Box position={'relative'} display={'block'} flex={1}>
            <Tabs>
              <TabList>
                <Tab>One</Tab>
                <Tab>Two</Tab>
                <Tab>Three</Tab>
              </TabList>
            </Tabs>
            <Result
              workspaceName={workspaceName as string}
              workspaceJsonPath={workspaceJsonPath as string}
              sessionId={sessionId as string}
              serverId={serverId as string}
              graph={graph as string}
            />
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
