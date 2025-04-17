import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGraphologyStore } from '../../../stores';
import Styles from './Result.module.scss';
import { useWorkspaceStore } from '../../../stores/workspaceStore';
import path from 'path';

// Dynamically import Sigma components with ssr disabled
const SigmaContainer = dynamic(
  () => import('@react-sigma/core').then((mod) => mod.SigmaContainer),
  { ssr: false },
);

const Information = dynamic(() => import('./addons/Information'), {
  ssr: false,
});
const Control = dynamic(() => import('./addons/Control'), { ssr: false });
const Layout = dynamic(() => import('./addons/Layout'), { ssr: false });
const MouseEvent = dynamic(() => import('./addons/MouseEvent'), { ssr: false });
const ExecutedEvent = dynamic(() => import('./addons/ExecutedEvent'), {
  ssr: false,
});

/**
 * @title WebGL2 Support Checker
 * @description Helper function to check WebGL2 support
 */
const isWebGL2Supported = () => {
  try {
    // Try creating a test canvas and getting WebGL2 context
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch (e) {
    return false;
  }
};

const Result = ({ workspaceResultPath }: { workspaceResultPath: string }) => {
  const graphology = useGraphologyStore((state) => state.graphology);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [webGL2Supported, setWebGL2Supported] = useState<boolean>(false);
  const { designer } = useWorkspaceStore();

  const lastExecutedTime = useGraphologyStore(
    (state) => state.lastExecutedTime,
  );

  useEffect(() => {
    setWebGL2Supported(isWebGL2Supported());
  }, []);

  useEffect(() => {
    setSelectedObjects([]);
  }, [lastExecutedTime]);

  useEffect(() => {
    window.ipc.invoke('writeFile/fullPath', {
      filePath: path.join(workspaceResultPath,`result.json`),
      fileData: JSON.stringify(graphology?.export(), null, 2),
    });
  }, [lastExecutedTime]);

  return (
    <Box
      w="100%"
      h="100%"
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      position={'relative'}
    >
      {graphology?.nodes().length > 0 || graphology?.edges().length > 0 ? (
        webGL2Supported ? (
          <SigmaContainer
            graph={graphology}
            className={Styles.SigmaContainer}
            settings={{
              labelSize: 16,
              renderEdgeLabels: true,
              enableEdgeEvents: true,
              itemSizesReference: 'screen',
              allowInvalidContainer: true,
              zoomToSizeRatioFunction(ratio) {
                return ratio;
              },
              nodeReducer: (node, attr) => {
                const text = designer[attr.label as string]?.text || undefined;
                const convertedLabel = attr.properties[text]
                  ? attr?.properties[text]
                  : attr.label;
                const nodeStyledata = {
                  size: designer[attr.label as string]?.size * 16 || 1 * 16,
                  color: designer[attr.label as string]?.color || '#000',
                  label: convertedLabel,
                };
                return { ...attr, label: convertedLabel, ...nodeStyledata };
              },
              edgeReducer: (edge, attr) => {
                const text = designer[attr.label as string]?.text || undefined;
                const convertedLabel = attr.properties[text]
                  ? attr?.properties[text]
                  : attr.label;
                const edgeStyledata = {
                  size: designer[attr.label as string]?.size * 4 || 1 * 4,
                  color: designer[attr.label as string]?.color || '#000',
                  label: convertedLabel,
                };
                return { ...attr, label: convertedLabel, ...edgeStyledata };
              },
            }}
          >
            <Information
              selectedObjects={selectedObjects}
              close={() => {
                setSelectedObjects([]);
              }}
            />
            <Control />
            <Layout lastExecutedTime={lastExecutedTime} />
            <MouseEvent setSelectedObjects={setSelectedObjects} />
            <ExecutedEvent lastExecutedTime={lastExecutedTime} />
          </SigmaContainer>
        ) : (
          <Box
            fontSize={'4xl'}
            color={'gray'}
            margin={'0 auto'}
            h={'12rem'}
            backgroundColor={'background'}
          >
            Sorry!! Your browser does not support WebGL2 <br />
            Please use a modern browser like Chrome, Firefox, or Edge <br />
            <br />
            <a
              href="https://webglreport.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check WebGL2 Support
            </a>
          </Box>
        )
      ) : (
        <React.Fragment>
          <Box
            fontSize={'4xl'}
            color={'gray'}
            margin={'0 auto'}
            h={'12rem'}
            backgroundColor={'background'}
          >
            Open editor to Press "Tab" key <br />
            Start writing your cypher query <br />
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};

export default Result;
