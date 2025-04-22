import { random, circular, circlepack } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import fa2Worker from 'graphology-layout-forceatlas2/worker';
import { useGraphologyStore } from '../../../../stores';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  SelectField,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PiPlay } from 'react-icons/pi';
import { set } from 'lodash';

const SlectAbleLayout = [
  { name: 'Random', value: 'random' },
  { name: 'Circular', value: 'circular' },
  { name: 'Circle Pack', value: 'circlepack' },
  { name: 'Force Atlas 2', value: 'force-atlas-2' },
];

interface LayoutProps {
  lastExecutedTime: number;
}

const Layout = ({ lastExecutedTime }: LayoutProps) => {
  const { setLayout } = useGraphologyStore();
  const layout = useGraphologyStore((state) => state.layout);
  const graphology = useGraphologyStore((state) => state.graphology);
  const [layoutWorker, setLayoutWorker] = useState<
    any & {
      kill: () => void;
      stop: () => void;
      start: () => void;
    }
  >(null);
  const [isRunningThisWorker, setIsRunningThisWorker] = useState(false);

  const _random = useCallback(() => {
    random.assign(graphology, {
      center: 0,
    });
  }, [graphology]);

  const _circular = useCallback(() => {
    circular.assign(graphology);
  }, [graphology]);

  const _circlepack = useCallback(() => {
    circlepack.assign(graphology);
  }, [graphology]);

  const _forceAtlas2 = useCallback(() => {
    const optimizedSetting = forceAtlas2.inferSettings(graphology);
    const worker = new fa2Worker(graphology, {
      settings: {
        ...optimizedSetting,
      },
    });
    worker.start();
    setLayoutWorker(worker);
    setIsRunningThisWorker(worker.isRunning());
    console.log('worker', worker);
  }, [graphology]);

  const handleLayoutWorkerKill = useCallback(() => {
    layoutWorker?.kill();
    setLayoutWorker(null);
    setIsRunningThisWorker(false);
  }, [layoutWorker]);

  const handleLayoutWorkerStop = useCallback(() => {
    layoutWorker?.stop();
    setIsRunningThisWorker(layoutWorker?.isRunning());
  }, [layoutWorker]);

  const handleLayoutWorkerStart = useCallback(() => {
    layoutWorker?.start();
    setIsRunningThisWorker(layoutWorker?.isRunning());
  }, [layoutWorker]);

  useEffect(() => {
    handleLayoutWorkerKill();
    switch (layout) {
      case 'random':
        _random();
        break;
      case 'circular':
        _circular();
        break;
      case 'circlepack':
        _circlepack();
        break;
      case 'force-atlas-2':
        _forceAtlas2();
        break;
      default:
        break;
    }
  }, [layout, lastExecutedTime, _random, _circular, _circlepack, _forceAtlas2]);

  return (
    <HStack
      pos={'absolute'}
      left={0}
      top={0}
      padding={'0.5rem'}
      borderRadius={'8px'}
      border={'1px solid gray'}
      backgroundColor={'#fff'}
      marginLeft={'1rem'}
      style={{
        height: 'auto',
      }}
    >
      <Text color={'black'}>
        <Text fontWeight={'bold'} float={'left'}>
          Layout :
        </Text>
        <SelectField
          value={layout}
          onChange={(e) => {
            setLayout(e.target.value);
          }}
          cursor={'pointer'}
        >
          {SlectAbleLayout.map((item, index) => (
            <option key={index + item.value} value={item.value}>
              {item.name}
            </option>
          ))}
        </SelectField>
      </Text>
      {layoutWorker && (
        <Box>
          <HStack>
            <Button
              leftIcon={isRunningThisWorker === true ? <Spinner /> : <PiPlay />}
              onClick={() => {
                if (isRunningThisWorker) {
                  handleLayoutWorkerStop();
                } else {
                  handleLayoutWorkerStart();
                }
              }}
            >
              <VStack gap={0} textAlign={'center'}>
                <Text fontSize={'sm'}>
                  Click to {isRunningThisWorker ? 'Stop' : 'Start'}
                </Text>
                {isRunningThisWorker === true ? (
                  <Text fontSize={'sm'}>layout processing...</Text>
                ) : (
                  <></>
                )}
              </VStack>
            </Button>
          </HStack>
        </Box>
      )}
    </HStack>
  );
};

export default Layout;
