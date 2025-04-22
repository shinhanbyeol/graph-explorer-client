import React from 'react';
import IpcDebugger from './debugger/Debugger';
import HomeBar from './home/HomeBar';
import Designer from './designer/Designer';
import CypherTool from './cypher/CypherTool';

const SidebarRenderer = ({ contents }: { contents: string | number }) => {
  return (
    <>
      <HomeBar visible={contents === 'home'} />
      <Designer visible={contents === 'designer'} />
      <IpcDebugger visible={contents === 'debug'} />
      <CypherTool visible={contents === 'cypher-tool'} />
    </>
  );
};

export default SidebarRenderer;
