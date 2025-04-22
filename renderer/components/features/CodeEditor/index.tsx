import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Box, Button, Progress, Text } from '@chakra-ui/react';

// Styles
import Styles from './CodeEditor.module.scss';
import { PiPlay } from 'react-icons/pi';
import _, { debounce } from 'lodash';
import useGraphology from '../../../hooks/useGraphology';
import { useGraphologyStore } from '../../../stores';

interface CodeEditorProps {
  workspaceSqlPath: string;
  graph: string;
  sessionId: string;
}

const CodeEditor = ({
  workspaceSqlPath,
  sessionId,
  graph,
}: CodeEditorProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [fetching, setFetching] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { importGraphologyData } = useGraphology();
  const {
    graphology,
    setEdgesCount,
    setNodesCount,
    setLastExecutedTime,
    setLabels,
  } = useGraphologyStore();

  const OS = navigator.platform;

  const handleOnFocusAtEditor = () => {
    setExpanded(true);
  };

  /**
   * @description Close the editor when clicking outside
   */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    },
    [rootRef, setExpanded],
  );

  /**
   * @description Save SQL
   * @param value
   */
  const handleSaveSql = useMemo(() => {
    return debounce((value: string) => {
      window.ipc
        .invoke('writeFile/fullPath', {
          filePath: workspaceSqlPath,
          fileData: value,
        })
        .then((res: IPCResponse<null>) => {});
    }, 500);
  }, [workspaceSqlPath]);

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
            const lastExecutedTime = Date.now();
            importGraphologyData(graphology, queryResult.result);
            setLabels(queryResult.labels);
            setNodesCount(queryResult.result.nodes.length);
            setEdgesCount(queryResult.result.edges.length);
            setLastExecutedTime(lastExecutedTime);
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
    setLabels,
    setNodesCount,
    setEdgesCount,
    setLastExecutedTime,
  ]);

  // 포커스 관련 이벤트 등록
  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  // SQL 파일 읽기
  useEffect(() => {
    window.ipc
      .invoke('readFile/fullPath', workspaceSqlPath)
      .then((res: IPCResponse<string>) => {
        if (res?.success) {
          typeof res.data === 'string' ? setCode(res.data) : setCode('');
        } else {
          setCode('');
        }
      });
  }, [workspaceSqlPath]);

  /**
   * @title Run Query by Shortcut
   * @description Run query by shortcut key (Ctrl + Enter or Cmd + Enter) / 단축키로 쿼리 실행 (Ctrl + Enter 또는 Cmd + Enter)
   */
  const _runQueryByShortcut = useCallback(
    (e: KeyboardEvent) => {
      // ctrl + enter or cmd + enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleRunQuery(code);
      }
      // press f5
      if (e.key === 'F5') {
        handleRunQuery(code);
      }
    },
    [code, handleRunQuery],
  );

  /**
   * @title Editor Fold by Shortcut
   * @description Fold editor by shortcut key (Esc) / 단축키로 에디터 접기 (Esc)
   */
  const _expandEditorByShortcutEscape = useCallback(
    (e: KeyboardEvent) => {
      // press esc
      if (e.key === 'Escape') {
        setExpanded(false);
      }
    },
    [setExpanded],
  );

  /**
   * @title Editor Expand by Shortcut
   * @description Expand editor by shortcut key (Tab) / 단축키로 에디터 확장 (Tab)
   */
  const _expandEditorByShortcutTab = useCallback(
    (e: KeyboardEvent) => {
      // press tab
      if (e.key === 'Tab') {
        setExpanded(true);
      }
    },
    [setExpanded],
  );

  // 에디터 확장 단축키 등록
  useEffect(() => {
    window.removeEventListener('keydown', _expandEditorByShortcutEscape);
    window.removeEventListener('keydown', _expandEditorByShortcutTab);
    if (expanded) {
      window.addEventListener('keydown', _expandEditorByShortcutEscape);
    } else {
      window.addEventListener('keydown', _expandEditorByShortcutTab);
    }
  }, [expanded, _expandEditorByShortcutEscape, _expandEditorByShortcutTab]);

  // 에디터 실행 단축키 등록
  useEffect(() => {
    window.addEventListener('keydown', _runQueryByShortcut);
    return () => {
      window.removeEventListener('keydown', _runQueryByShortcut);
    };
  }, [workspaceSqlPath, _runQueryByShortcut]);

  return (
    <>
      {fetching && (
        <Box
          backgroundColor="rgba(255, 255, 255, 0.5)"
          width={'100%'}
          height={'100%'}
          position={'absolute'}
          top={0}
          left={0}
          zIndex={'sticky'}
        >
          <Progress size="xs" isIndeterminate colorScheme={'black'} />
        </Box>
      )}
      <div
        ref={rootRef}
        className={`${Styles.Root} ${expanded ? Styles.Expand : ''}`}
      >
        {expanded && (
          <Box
            pl={'1rem'}
            pr={'1rem'}
            pb={2}
            display={'flex'}
            justifyContent={'flex-end'}
            zIndex={'sticky'}
          >
            <Button
              variant={'submit'}
              size={'xl'}
              leftIcon={<PiPlay />}
              onClick={() => {
                handleRunQuery(code);
              }}
            >
              <Box
                display={'flex'}
                alignItems={'center'}
                flexDir={'column'}
                gap={1}
              >
                <Text>Run Query</Text>
                <Text fontSize={'xs'} color={'gray'} display={'block'}>
                  {OS === 'MacIntel' ? ' (Cmd + Enter)' : ' (Ctrl + Enter)'}
                </Text>
              </Box>
            </Button>
          </Box>
        )}
        <div className={`${Styles.Editor}`}>
          <CodeMirror
            value={code}
            lang="cypher"
            height="100%"
            onFocus={handleOnFocusAtEditor}
            onChange={(value) => {
              setCode(value);
              handleSaveSql(value);
            }}
          />
        </div>
        <Box></Box>
      </div>
    </>
  );
};

export default CodeEditor;
