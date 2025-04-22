import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import useGraphology from '../../../../hooks/useGraphology';
import { useGraphologyStore } from '../../../../stores';

import {
  Divider,
  VStack,
  Text,
  HStack,
  TagLabel,
  Tag,
  Box,
} from '@chakra-ui/react';

interface CypherToolProps {
  visible: boolean;
}

function CypherTool({ visible }: CypherToolProps) {
  const router = useRouter();
  const {
    serverId,
    serverName,
    graph,
    sessionId,
    workspaceName,
    workspaceSqlPath,
    workspaceJsonPath,
  } = router.query;
  const { importGraphologyData } = useGraphology();
  const {
    graphology,
    setEdgesCount,
    setNodesCount,
    setLastExecutedTime,
    setLabels,
  } = useGraphologyStore();

  // isFetching state
  const [fetching, setFetching] = useState<boolean>(false);
  // metadata state
  const [nodeMeta, setNodeMeta] = useState<{
    [key: string]: number;
  }>({});
  const [edgeMeta, setEdgeMeta] = useState<{
    [key: string]: number;
  }>({});

  /**
   * @description Run Query
   * @param value
   */
  const handleRunQuery = useMemo(() => {
    return debounce(async (value: string) => {
      setFetching(true);
      await window.ipc
        .invoke('excuteQuery', {
          sessionId: sessionId,
          graph: graph,
          query: value,
        })
        .then((res: IPCResponse<ExecuteQueryResponseBy>) => {
          if (res?.success) {
            const queryResult = res.data;
            importGraphologyData(graphology, queryResult.result);
            setLabels(queryResult.labels);
            setNodesCount(queryResult.result.nodes.length);
            setEdgesCount(queryResult.result.edges.length);
            setLastExecutedTime(Date.now());
          } else {
            alert(res.message);
          }
        })
        .finally(() => {
          setFetching(false);
        });
    }, 500);
  }, [
    sessionId,
    graph,
    graphology,
    importGraphologyData,
    setNodesCount,
    setEdgesCount,
    setLastExecutedTime,
  ]);

  useEffect(() => {
    console.log('CypherTool mounted: ' + sessionId + ':' + graph);
    window.ipc
      .invoke('getMetadata', {
        connectionId: sessionId,
        graphPath: graph,
      })
      .then((res: IPCResponse<string>) => {
        if (res.success && res.data) {
          const { nodeMeta, edgeMeta } = res.data as any;
          setNodeMeta(nodeMeta);
          setEdgeMeta(edgeMeta);
        }
      });
  }, [sessionId, graph, workspaceName]);

  return (
    <VStack
      display={visible ? 'flex' : 'none'}
      align="stretch"
      pt={5}
      pb={5}
      pl={4}
      pr={4}
      h={'100%'}
      direction={['column']}
      spacing={'2rem'}
      divider={<Divider color="black" />}
      width={'100%'}
      overflow={'hidden'}
    >
      <Text fontWeight="bold" fontSize={'lg'} textAlign={'center'}>
        Cypher Tool
      </Text>

      <Box>
        <Text fontSize={'md'} mb={2}>
          Match by Node Label
        </Text>

        <HStack flexWrap={'wrap'}>
          <Tag
            key={'allNode'}
            color={'white'}
            bg={'black'}
            cursor={'pointer'}
            onClick={() => handleRunQuery('MATCH (n) return n;')}
          >
            <TagLabel>*</TagLabel>
          </Tag>
          {Object.keys(nodeMeta).map((label) => (
            <Tag
              key={label}
              color={'white'}
              bg={'black'}
              cursor={'pointer'}
              onClick={() => handleRunQuery(`MATCH (n:${label}) return n;`)}
              minW={`max-content`}
            >
              <TagLabel>{`${label} (${nodeMeta[label]})`}</TagLabel>
            </Tag>
          ))}
        </HStack>
      </Box>

      <Box>
        <Text fontSize={'md'} mb={2}>
          Match by Edge Label
        </Text>
        <HStack flexWrap={'wrap'}>
          <Tag
            key={'allEdge'}
            color={'white'}
            bg={'black'}
            cursor={'pointer'}
            onClick={() => handleRunQuery(`MATCH (n)-[e]->(m) return n,e,m;`)}
          >
            <TagLabel>*</TagLabel>
          </Tag>
          {Object.keys(edgeMeta).map((label) => (
            <Tag
              key={label}
              color={'white'}
              bg={'black'}
              cursor={'pointer'}
              onClick={() =>
                handleRunQuery(`MATCH (n)-[e:${label}]->(m) return n,e,m;`)
              }
              minW={`max-content`}
            >
              <TagLabel>{`${label} (${edgeMeta[label]})`}</TagLabel>
            </Tag>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}

export default CypherTool;
