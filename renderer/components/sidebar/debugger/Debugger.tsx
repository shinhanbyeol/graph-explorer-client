import { useEffect, useState } from 'react';
import { Select, Button, Text, Textarea, Box } from '@chakra-ui/react';
import { useDebugStore } from '../../../stores';
import {
  DEBUGGERLIST,
  DEBUGGER_SAMPLE_PARAMS,
  DEBUGGER_DESCRIPTION,
  DEBUGGER_PARAM_TYPE,
} from '../../../constants/debugFeat';

interface IpcDebuggerProps {
  visible: boolean;
}

const IpcDebugger = ({ visible }: IpcDebuggerProps) => {
  const { tester, setTester, setResult } = useDebugStore();
  const [param, setParam] = useState<any>(null);
  const [parmField, setParamField] = useState<string>(null);

  const handleExecuteTest = () => {
    console.log('🚀' + tester + ': request', param);
    try {
      window.ipc.invoke(tester, param).then((res) => {
        console.log('🚀' + tester + ': response', res);
        setResult(res);
      });
    } catch (e) {
      setResult(e.message);
    }
  };

  const handleOnChangeParams = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParamField(e.target.value);
    // setParam(JSON.parse(e.target.value));
  };

  useEffect(() => {
    try {
      setParam(JSON.parse(parmField));
    } catch (e) {
      console.error(e);
    }
  }, [parmField]);

  useEffect(() => {
    setParam(DEBUGGER_SAMPLE_PARAMS[tester] ?? '');
    setParamField(
      JSON.stringify(DEBUGGER_SAMPLE_PARAMS[tester] ?? '', null, 2),
    );
  }, [tester]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTester(e.target.value);
  };

  return (
    <Box
      display={visible ? 'flex' : 'none'}
      flexDirection={'column'}
      width={'100%'}
      backgroundColor={'background'}
      padding={'1rem'}
    >
      <Text fontSize={'4xl'}>AGE-Viewer-2.0 IPC Debugger</Text>
      <Select onChange={handleSelectChange} value={tester ?? ''}>
        <option value="" disabled>
          Select a feature
        </option>
        {DEBUGGERLIST.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Text fontSize={'2xl'} marginTop={'3rem'}>
        Feature & description:
      </Text>
      <Text fontSize={'1xl'} marginLeft={'1rem'}>
        {DEBUGGER_DESCRIPTION[tester]}
      </Text>
      <Text fontSize={'2xl'} marginTop={'3rem'}>
        Params:
      </Text>
      <Text fontSize={'1xl'} marginLeft={'1rem'} marginBottom={'1rem'}>
        Param type: {DEBUGGER_PARAM_TYPE[tester]}
      </Text>
      <Textarea
        style={{
          height: '18.75rem',
          border: '1px solid #ccc',
        }}
        backgroundColor={'#fff'}
        value={parmField ?? ''}
        onChange={handleOnChangeParams}
      />
      <br />
      <br />
      <Button onClick={handleExecuteTest}>Click me test</Button>
    </Box>
  );
};

export default IpcDebugger;
