import { Box, forwardRef, Flex, Icon, BoxProps } from '@chakra-ui/react';
import Styles from './Sidebar.module.scss';
import { useState } from 'react';
import { useRouter } from 'next/router';
import SidebarRenderer from '../../components/sidebar';

//icons
import {
  PiPalette,
  PiHouse,
  PiGear,
  PiFile,
  PiGraphThin,
} from 'react-icons/pi';

interface SidebarProps {
  x: number;
}

const MenuItemBox = forwardRef<
  {
    active?: boolean;
  } & BoxProps,
  'div'
>((props, ref) => (
  <Box
    width={50}
    height={50}
    bg={props.active ? 'background' : 'black'}
    textAlign={'center'}
    p={'25%'}
    fontSize={'x-large'}
    color={props.active ? 'black' : 'background'}
    _hover={{
      bg: 'background',
      cursor: 'pointer',
      color: 'black',
    }}
    {...props}
    ref={ref}
  />
));

export const Sidebar = ({ x }: SidebarProps) => {
  const [sidebar, setSidebar] = useState<string | number>('home');
  const [isHide, setIsHide] = useState<boolean>(false);
  const router = useRouter();

  function toggleHide(name: string | number) {
    if (isHide) {
      setIsHide(false);
    }
    if (!isHide && sidebar === name) {
      setIsHide(true);
    }
  }

  return (
    <Box
      className={Styles.Root}
      minW={isHide ? 50 : 240}
      width={isHide ? 50 : x}
      resize="both"
      backgroundColor={'background'}
    >
      <Flex direction="row" justify="flex-start" align="center">
        <Flex
          minW={50}
          height={'100vh'}
          direction="column"
          backgroundColor={'black'}
        >
          <MenuItemBox
            active={sidebar === 'home'}
            onClick={() => {
              setSidebar('home');
              toggleHide('home');
              // router.push('/home');
            }}
          >
            <Icon
              as={PiHouse}
              // color={sidebar === 'home' ? 'black' : 'Background'}
            />
          </MenuItemBox>
          <MenuItemBox
            active={sidebar === 'cypher-tool'}
            onClick={() => {
              setSidebar('cypher-tool');
              toggleHide('cypher-tool');
            }}
          >
            <Icon as={PiGraphThin} />
          </MenuItemBox>
          <MenuItemBox
            active={sidebar === 'designer'}
            onClick={() => {
              setSidebar('designer');
              toggleHide('designer');
            }}
          >
            <Icon
              as={PiPalette}
              // color={sidebar === 'designer' ? 'black' : 'Background'}
            />
          </MenuItemBox>
          <MenuItemBox
            active={sidebar === 'debug'}
            onClick={() => {
              setSidebar('debug');
              toggleHide('debug');
              router.push('/debug');
            }}
          >
            <Icon as={PiGear} />
          </MenuItemBox>
        </Flex>
        <Box overflowY={'auto'} width={'100%'} height={'100vh'}>
          <SidebarRenderer contents={sidebar} />
        </Box>
      </Flex>
    </Box>
  );
};
