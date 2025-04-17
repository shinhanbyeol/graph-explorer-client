// ipc
import { ipcMain } from 'electron';

// node.js
import fs from 'fs';
import path from 'path';

// service
import ConnectionsMap from '../connections/connectionMaps';
import ServerService from '../service/serverService';
import CypherService from '../service/cypherService';
import WorkspaceService from '../service/workspaceService';

// types
import { HandleResponse } from './types';
import { ConnectionPool } from '../connections/types';
import { AGE_FLAVOR } from '../connections/enum';
class IpcMainController {
  appData;
  connectionsMap: ConnectionsMap;
  app;
  cachePath;
  constructor(appData, app, cachePath) {
    this.init();
    this.appData = appData;
    this.connectionsMap = new ConnectionsMap();
    this.app = app;
    this.cachePath = cachePath;
  }

  init() {
    /**
     * @description Get Servers
     * @returns servers
     */
    ipcMain.handle(
      'getServers',
      async (event): Promise<HandleResponse<ServerResponse[]>> => {
        try {
          const serverService = new ServerService(this.appData);
          const servers = await serverService.getServers();
          return {
            success: true,
            error: false,
            message: 'Servers fetched',
            stack: null,
            data: servers,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Get Server
     * @param {String} payload
     * @returns server
     */
    ipcMain.handle('getServer', async (event, payload: number) => {
      try {
        const serverService = new ServerService(this.appData);
        const server = await serverService.getServer(payload);
        return server;
      } catch (error) {
        return {
          success: false,
          error: true,
          message: error.message,
          stack: error.stack,
        };
      }
    });

    /**
     * @description Add Server
     * @param {
     * name: string,
     * host: string,
     * port: number,
     * database: string,
     * user: string,
     * password: string,
     * serverType: AGE_FLAVOR
     * } payload
     * @returns {string} serverId
     */
    ipcMain.handle(
      'addServer',
      async (
        event,
        payload: {
          name: string;
          host: string;
          port: number;
          database: string;
          user: string;
          password: string;
          serverType: AGE_FLAVOR;
          version: string;
        },
      ): Promise<HandleResponse<string>> => {
        try {
          const serverService = new ServerService(this.appData);
          const serverId = await serverService.addServer(payload);
          return {
            success: true,
            error: false,
            message: 'Server added',
            stack: null,
            data: serverId,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Update Server
     * @param {
     * name: string,
     * host: string,
     * port: number,
     * database: string,
     * user: string,
     * password: string,
     * serverType?: AGE_FLAVOR
     * } payload
     */
    ipcMain.handle(
      'updateServer',
      async (
        event,
        payload: {
          id: number;
          name: string;
          host: string;
          port: number;
          database: string;
          user: string;
          password: string;
          serverType: AGE_FLAVOR;
          version: string;
        },
      ): Promise<HandleResponse<null>> => {
        try {
          const serverService = new ServerService(this.appData);
          const serverId = await serverService.updateServer(payload);
          return {
            success: true,
            error: false,
            message: 'Server updated',
            stack: null,
            data: null,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Remove Server
     * @param {String} payload
     * @returns {string} serverId
     */
    ipcMain.handle(
      'removeServer',
      async (event, payload: string): Promise<HandleResponse<null>> => {
        try {
          const serverService = new ServerService(this.appData);
          await serverService.removeServer(payload);
          return {
            success: true,
            error: false,
            message: 'Server removed',
            stack: null,
            data: null,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Get Metadata
     * @param {
     * connectionId: string,
     * graphPath: string
     * } payload
     */
    ipcMain.handle(
      'getMetadata',
      async (
        event,
        payload,
      ): Promise<
        HandleResponse<{
          nodeMeat: any;
          edgeMeta: any;
          propertyMeta: any;
        }>
      > => {
        try {
          const connection = await this.connectionsMap.getConnection(
            payload.connectionId,
          );
          const metadata = await connection.getMetadata(payload.graphPath);
          return {
            success: true,
            error: false,
            message: 'Metadata fetched',
            stack: null,
            data: metadata,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Get Connections
     *              kor: 커넥션 리스트 가져오기
     * @returns {Promise}
     */
    ipcMain.handle(
      'getConnections',
      async (
        event,
        payload,
      ): Promise<
        HandleResponse<ConnectionPool | Map<string, ConnectionPool>>
      > => {
        try {
          const connection = this.connectionsMap.getConnections(payload);
          return {
            success: true,
            error: false,
            message: 'Connections fetched',
            stack: null,
            data: connection,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Create Connection
     *              kor: 데이터베이스 커넥션 생성
     * @param {
     * id: string,
     * severType: 'AGE' | 'AGENSGRAPH',
     * host: string,
     * port: number,
     * user: string,
     * password: string,
     * database: string
     * } payload
     * @returns {
     * sessionId: string | null,
     * success: boolean,
     * error: boolean,
     * message: string,
     * stack: string | null
     * } testResult
     */
    ipcMain.handle(
      'createConnnection',
      async (
        event,
        payload,
      ): Promise<
        HandleResponse<{
          sessionId: string;
          success: boolean;
          error: boolean;
          message: string;
          stack: string | null;
        }>
      > => {
        try {
          const serverService = new ServerService(this.appData);
          const server = await serverService.getServer(payload.id);
          const config = {
            host: server.host,
            port: server.port,
            user: server.user,
            password: server.password,
            database: server.database,
          };

          const version = server.version;
          const session = await this.connectionsMap.addConnection(
            config,
            server.serverType === 'AGE'
              ? AGE_FLAVOR.AGE
              : AGE_FLAVOR.AGENSGRAPH,
            version,
          );

          if (session.sessionId === null) {
            return {
              success: false,
              error: true,
              message: 'Connection failed',
              stack: null,
            };
          }

          // return session;
          return {
            success: true,
            error: false,
            message: 'Connection Success',
            stack: null,
            data: session,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Check Connection
     *              kor: 커넥션 연결상태 확인
     * @param {String} sessionId
     * @returns {Promise} {sessionId, isConnected}
     */
    ipcMain.handle(
      'checkConnection',
      async (
        event,
        payload,
      ): Promise<
        HandleResponse<{
          sessionId: string;
          isConnected: boolean;
        }>
      > => {
        try {
          const connection = await this.connectionsMap.getConnection(payload);
          const test = (await connection?.testConnection()) ?? {
            success: false,
            error: true,
          };
          // remove connection if connection is not connected
          if (test.error) {
            await this.connectionsMap.removeConnectionBySessionId(payload);
          }
          return {
            success: true,
            error: false,
            message: 'Connection checked',
            stack: null,
            data: {
              sessionId: payload,
              isConnected: Boolean(test.success),
            },
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Disconnect Server
     *              kor: 연결 해제
     * @param {String} sessionId
     * @returns {Promise}
     */
    ipcMain.handle(
      'disconnectServer',
      async (event, payload): Promise<HandleResponse<null>> => {
        try {
          await this.connectionsMap.removeConnectionBySessionId(payload);
          return {
            success: true,
            error: false,
            message: 'Server disconnected',
            stack: null,
            data: null,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description get graph path list (schema list)
     *              kor: 그래프 경로 리스트 가져오기 (스키마 리스트)
     * @param {String} sessionId
     */
    ipcMain.handle(
      'getGraphs',
      async (event, payload): Promise<HandleResponse<string[]>> => {
        try {
          const connection = await this.connectionsMap.getConnection(payload);
          const graphPathList = await connection.getGraphPaths();
          // return graphPathList;
          return {
            success: true,
            error: false,
            message: 'Graphs fetched',
            stack: null,
            data: graphPathList,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Excute Query
     *              kor: 쿼리 실행
     * @param {String} payload.sessionId
     * @param {String} payload.query
     * @param {string} payload.graph graph is non required
     * @returns {Promise}
     */
    ipcMain.handle(
      'excuteQuery',
      async (event, payload): Promise<HandleResponse<any>> => {
        try {
          const connection = await this.connectionsMap.getConnection(
            payload.sessionId,
          );
          const cypherService = new CypherService(connection.type);
          const _result = await connection.excuteQuery(
            payload.query,
            payload.graph,
          );
          const result = cypherService.createResult(_result);
          return {
            success: true,
            error: false,
            message: 'Query executed',
            stack: null,
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description create workspace
     * @param payload.serverId
     * @param payload.name
     * @param payload.graph
     */
    ipcMain.handle(
      'createWorkspace',
      async (
        event,
        payload: {
          serverId: number;
          name: string;
          graph: string;
        },
      ): Promise<HandleResponse<string>> => {
        try {
          const workspaceService = new WorkspaceService(this.appData);
          const workspaceId = await workspaceService.addWorkspace(
            payload,
            this.cachePath,
          );
          return {
            success: true,
            error: false,
            message: 'Workspace created',
            stack: null,
            data: workspaceId,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description get workspaces
     * @param payload.serverId
     * @param payload.graph
     */
    ipcMain.handle(
      'getWorkspaces',
      async (
        event,
        payload: {
          serverId: number;
          graph: string;
        },
      ): Promise<HandleResponse<WorkspaceResponse[]>> => {
        try {
          const workspaceService = new WorkspaceService(this.appData);
          const workspaces = await workspaceService.getWorkspaces(
            payload.serverId,
            payload.graph,
          );
          return {
            success: true,
            error: false,
            message: 'Workspaces fetched',
            stack: null,
            data: workspaces,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description for file update by full file path
     * @param {String} payload.filePath
     * @param {String} payload.fileData
     */
    ipcMain.handle(
      'writeFile/fullPath',
      async (
        event,
        payload: {
          filePath: string;
          fileData: string;
        },
      ): Promise<HandleResponse<null>> => {
        try {
          await fs.writeFileSync(payload.filePath, payload.fileData);
        } catch (err) {
          return {
            success: false,
            error: true,
            message: err.message,
            stack: err.stack,
          };
        }
      },
    );

    /**
     * @description for file read by full file path
     * @param {String}
     * @returns {Promise<File>}
     * @param {String} payload.filePath
     */
    ipcMain.handle(
      'readFile/fullPath',
      async (event, payload: string): Promise<HandleResponse<string>> => {
        try {
          const code = await fs.readFileSync(payload, 'utf8');
          return {
            success: true,
            error: false,
            message: 'File read',
            stack: null,
            data: code,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: 'File read error:' + error.message,
            stack: error.stack,
          };
        }
      },
    );

    /**
     * @description Write File
     *              Save the file to different paths depending on the file type.
     *              kor: 파일 쓰기
     *              kor: 파일 type 에 따라 각기 다른경로에 파일을 저장한다.
     * @param payload.fileName
     * @param payload.fileType
     * @param payload.fileExt
     * @param payload.fileData
     */
    ipcMain.handle(
      'writeFile',
      async (event, payload): Promise<HandleResponse<null>> => {
        try {
          const { fileName, fileType, fileExt } = payload;
          const fileFullPath = path.join(
            this.cachePath,
            `${fileType}`,
            `${fileName}.${fileExt}`,
          );
          await fs.writeFileSync(fileFullPath, payload.fileData);
          return {
            success: true,
            error: false,
            message: 'File written',
            stack: null,
            data: null,
          };
        } catch (err) {
          return {
            success: false,
            error: true,
            message: err.message,
            stack: err.stack,
          };
        }
      },
    );

    /**
     * @description Read File at cache folder
     *              Load the file into different paths depending on the file type.
     *              kor: 캐시 폴더에서 파일 읽기
     *              kor: 파일 type 에 따라 각기 다른경로에 파일을 불러들인다.
     * @param payload.fileName
     * @param payload.fileType
     * @param payload.fileExt
     * @returns {Promise<File>}
     */
    ipcMain.handle(
      'readFile',
      async (event, payload): Promise<HandleResponse<string>> => {
        try {
          const { fileName, fileType, fileExt } = payload;
          const appPath = this.app.getAppPath();
          const fileFullPath = path.join(
            this.cachePath,
            `${fileType}`,
            `${fileName}.${fileExt}`,
          );
          const code = await fs.readFileSync(fileFullPath, 'utf8');
          return {
            success: true,
            error: false,
            message: 'File readed',
            stack: null,
            data: code,
          };
        } catch (error) {
          return {
            success: false,
            error: true,
            message: error.message,
            stack: error.stack,
          };
        }
      },
    );
  }
}

export default IpcMainController;
