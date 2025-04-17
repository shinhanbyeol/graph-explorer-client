import { Box, Flex, Button, Text, IconButton, Mark } from '@chakra-ui/react';
import { useGraphologyStore } from '../../../../stores';
import { useWorkspaceStore } from '../../../../stores/workspaceStore';
import { PiX } from 'react-icons/pi';

function Information({
  selectedObjects,
  close,
}: {
  selectedObjects: string[];
  close: () => void;
}) {
  const graphology = useGraphologyStore((state) => state.graphology);
  const { designer } = useWorkspaceStore();

  // current 1 item view in futer will be multiple
  const firstItem = selectedObjects[0];

  const type = graphology.hasNode(firstItem)
    ? 'Node'
    : graphology.hasEdge(firstItem)
    ? 'Edge'
    : 'Unknown';

  const properties =
    type === 'Node'
      ? graphology.getNodeAttributes(firstItem).properties
      : type === 'Edge'
      ? graphology.getEdgeAttributes(firstItem).properties
      : 'Unknown';

  const label =
    type === 'Node'
      ? graphology.getNodeAttributes(firstItem).label
      : type === 'Edge'
      ? graphology.getEdgeAttributes(firstItem).label
      : 'Unknown';

  const style = designer[label] ?? undefined;

  return type === 'Unknown' ? (
    <></>
  ) : (
    <Box
      pos={'absolute'}
      right={16}
      bottom={24}
      padding={'1rem'}
      borderRadius={'8px'}
      backgroundColor={'#fff'}
      marginLeft={'1rem'}
      maxH={'50%'}
      minW={'300px'}
      bg={'fff'}
      color={'black'}
      borderColor={'black'}
      boxShadow={'lg'}
    >
      <Flex
        justifyContent={'space-between'}
        mb={6}
        alignContent={'center'}
        alignItems={'center'}
      >
        <Box
          bg={style?.color ?? 'black'}
          w={'fit-content'}
          pl={4}
          pr={4}
          mt={4}
          borderRadius={'24px'}
        >
          <Text
            color={'Background'}
            fontSize={'xl'}
            fontWeight={'bold'}
            display={'flex'}
            alignItems={'center'}
          >
            {label}{' '}
            {Object(properties)[style?.text] && (
              <Mark fontSize={'xs'} color={'white'} ml={2}>
                {Object(properties)[style?.text]}
              </Mark>
            )}
          </Text>
        </Box>
        <IconButton aria-label="Close" icon={<PiX />} onClick={() => close()} />
      </Flex>
      <Box fontSize={'md'} p={'1rem'} overflowY={'auto'}>
        {Object.entries(properties).map(([key, value]: any) => (
          <Flex key={key} justifyContent={'space-between'}>
            <Mark fontWeight={'bold'} fontSize={'sm'}>
              {key}
            </Mark>{' '}
            <Mark color={'gray'} fontSize={'sm'}>
              {value ?? ''}
            </Mark>
          </Flex>
        ))}
      </Box>
    </Box>
  );
}

export default Information;
