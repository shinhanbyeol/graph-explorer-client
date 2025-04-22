import { random, circular, circlepack } from 'graphology-layout';
import { useGraphologyStore } from '../../../../stores';
import { useCallback, useEffect } from 'react';
import { Box, SelectField, Text } from '@chakra-ui/react';
import { DEFAULT_SETTINGS } from 'sigma/settings';

const SlectAbleLayout = [
  { name: 'Random', value: 'random' },
  { name: 'Circular', value: 'circular' },
  { name: 'Circle Pack', value: 'circlepack' },
];

interface LayoutProps {
  lastExecutedTime: number;
}

const Layout = ({ lastExecutedTime }: LayoutProps) => {
  const { setLayout } = useGraphologyStore();
  const layout = useGraphologyStore((state) => state.layout);
  const graphology = useGraphologyStore((state) => state.graphology);

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

  useEffect(() => {
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
      default:
        break;
    }
  }, [layout, lastExecutedTime]);

  return (
    <Box
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
    </Box>
  );
};

export default Layout;
