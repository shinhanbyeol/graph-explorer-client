import {
  Box,
  FormLabel,
  Input,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  Divider,
  Text,
} from '@chakra-ui/react';
import { useGraphologyStore } from '../../../stores';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspaceStore';
import { debounce } from 'lodash';

interface DesignerProps {
  visible: boolean;
}

const Desinger = ({ visible }: DesignerProps) => {
  const { labels } = useGraphologyStore();
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const { designer, workspaceJsonPath, initDesigner, setDesigner } =
    useWorkspaceStore();

  const currentSettings = useMemo(
    () =>
      Object(designer)[selectedLabel] ? Object(designer)[selectedLabel] : {},
    [selectedLabel, designer],
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedLabel(e.target.value);
    },
    [setSelectedLabel],
  );

  const handleOnChangeSetting = useCallback(
    (option, value) => {
      if (!selectedLabel) return;
      const _settings = Object.assign({}, currentSettings);
      _settings[option] = value;
      setDesigner(selectedLabel, _settings);
    },
    [currentSettings, selectedLabel],
  );

  const handleOnChangeSettingDebounce = useMemo(
    () =>
      debounce((option, value) => {
        if (!selectedLabel) return;
        const _settings = Object.assign({}, currentSettings);
        _settings[option] = value;
        setDesigner(selectedLabel, _settings);
      }, 500),
    [currentSettings, selectedLabel],
  );

  const updateSettings = useCallback(() => {
    window.ipc
      .invoke('writeFile/fullPath', {
        filePath: workspaceJsonPath,
        fileData: JSON.stringify({
          ...designer,
        }),
      })
      .then((res: IPCResponse<null>) => {
        if (res?.error) {
          alert(res.message);
        }
      });
  }, [workspaceJsonPath, designer]);

  const loadSettings = useCallback(() => {
    if (!workspaceJsonPath) return;
    window.ipc
      .invoke('readFile/fullPath', workspaceJsonPath)
      .then((res: IPCResponse<string>) => {
        if (res?.error) {
          initDesigner({});
        } else {
          const loadedSettings = JSON.parse(res.data);
          initDesigner(loadedSettings);
        }
      });
  }, [workspaceJsonPath]);

  useEffect(() => {
    setSelectedLabel('');
    if (workspaceJsonPath) {
      loadSettings();
    }
  }, [workspaceJsonPath]);

  useEffect(() => {
    if (workspaceJsonPath) {
      updateSettings();
    }
  }, [designer]);

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
    >
      <Text fontWeight="bold" fontSize={'lg'} textAlign={'center'}>
        Graph Designer
      </Text>
      <Box>
        <FormLabel>Labels</FormLabel>
        <Select
          onChange={handleSelect}
          defaultValue={null}
          value={selectedLabel}
          unselectable="on"
          placeholder="Select Label..."
        >
          {labels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </Select>
      </Box>

      <Box>
        <FormLabel color={!selectedLabel ? '#c4c4c4' : ''}>Color</FormLabel>
        <Input
          type="color"
          value={currentSettings.color ?? '#000'}
          onChange={(e) => {
            handleOnChangeSettingDebounce('color', e.target.value);
          }}
          disabled={!selectedLabel}
        />
      </Box>

      <Box>
        <FormLabel color={!selectedLabel ? '#c4c4c4' : ''}>Text</FormLabel>
        <Input
          type="text"
          value={currentSettings.text ?? ''}
          onChange={(e) => {
            handleOnChangeSetting('text', e.target.value);
          }}
          disabled={!selectedLabel}
        />
      </Box>

      <Box>
        <FormLabel color={!selectedLabel ? '#c4c4c4' : ''}>
          Size: {currentSettings.size}
        </FormLabel>
        <Slider
          min={1}
          max={10}
          aria-label="slider-ex-1"
          value={currentSettings.size ?? 1}
          onChange={(e) => {
            handleOnChangeSetting('size', Number(e));
          }}
        >
          <SliderTrack backgroundColor="black.alpha.20">
            <SliderFilledTrack backgroundColor="black" />
          </SliderTrack>
          <SliderThumb backgroundColor="black" />
        </Slider>
      </Box>
    </VStack>
  );
};

export default memo(Desinger);
