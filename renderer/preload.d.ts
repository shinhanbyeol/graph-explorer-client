import { IpcHandler } from '../main/preload';
import { AGE_FLAVOR } from './utils/enum';

declare global {
  interface Window {
    ipc: IpcHandler;
  }
  // response types of ipc
  interface IPCResponse<T> {
    success: boolean;
    error: boolean;
    message: string;
    stack: string | null;
    data: T;
  }

  // get server list response
  interface ServerResponse {
    id: number;
    serverType?: AGE_FLAVOR;
    version?: string;
    name: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    created_at: string;
    updated_at: string;
  }

  // createConnection response
  interface createConnectionResponse {
    sessionId: string | null;
    success: boolean;
    error: boolean;
    message: string;
    stack: string | null;
  }

  // get workspace list response
  interface WorkspaceResponse {
    id: number;
    serverId: number;
    graph: string;
    name: string;
    sqlPath: string;
    jsonPath: string;
    resultPath: string;
    created_at: string;
    updated_at: string;
  }

  // Query response
  interface ExecuteQueryResponseBy {
    columns: string[];
    labels: string[];
    command: string;
    rowCount: number;
    result: GraphData;
  }
}
