import { PoolClient } from 'pg';
import { AGE_FLAVOR } from '../enum';

export interface Config_AGE {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export declare class ConnectionMaps {
  connections: Map<string, any>;
  constructor();
  addConnection(config: any, serverType: AGE_FLAVOR): Promise<string>;
  removeConnectionByServerId(serverId: any): string;
  removeConnectionBySessionId(sessionId: any): string;
  getConnection(sessionId: any): any;
  getConnections(payload: any): any;
}

export declare class ConnectionPool {
  config: any;
  pool: any;
  type: AGE_FLAVOR;
  version: string;
  sqls: any;
  constructor(config: any, type: AGE_FLAVOR, version: string);
  testConnection(): Promise<{
    success: boolean;
    error: boolean;
    message: string;
    stack: string | null;
  }>;
  getConnection(scheme: string): PoolClient;
  getMetadata(graphPath: string): {
    nodeMeat: any;
    edgeMeta: any;
    propertyMeta: any;
  };
  getGraphPaths: () => Promise<string[]>;
  excuteQuery(query: string, graph: string): Promise<any>;
  excuteQueryWithParams(query: string, params: any): Promise<any>;
  excuteCypherWithParams(query: string, params: any): Promise<any>;
  close(): Promise<void>;
}
