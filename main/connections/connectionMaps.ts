import { v4 as uuidv4 } from 'uuid';
import GraphRepository from './graphRepository';
import { Config_AGE, ConnectionPool } from './types';
import { AGE_FLAVOR } from './enum';

export default class ConnectionMaps {
  connections: Map<string, ConnectionPool>;
  constructor() {
    this.connections = new Map<string, ConnectionPool>();
  }

  /**
   * @description Add Connection
   * @param config
   * @param serverType
   * @param version
   * @returns sessionId or error
   */
  async addConnection(
    config: Config_AGE,
    serverType: AGE_FLAVOR,
    version: string,
  ): Promise<{
    sessionId: string | null;
    success: boolean;
    error: boolean;
    message: string;
    stack: string | null;
  }> {
    let connection = null;
    switch (serverType) {
      case AGE_FLAVOR.AGE:
        connection = new GraphRepository(config, serverType, version);
        break;
      case AGE_FLAVOR.AGENSGRAPH:
        connection = new GraphRepository(config, serverType, version);
        break;
      default:
        console.error('Server Type is' + serverType);
        throw Error('Server Type is not defined');
    }
    const sessionId = uuidv4();
    // connection test
    const test = await connection.testConnection();
    if (test.success) {
      this.connections.set(sessionId, connection);
      return {
        sessionId: sessionId,
        ...test,
      };
    } else {
      return {
        sessionId: null,
        ...test,
      };
    }
  }

  /**
   * @description Remove Connection
   * @param serverId
   * @returns sessionId
   */
  removeConnectionByServerId(serverId) {
    let sessionId = null;
    try {
      this.connections.forEach((connection, key) => {
        if (connection.config.id === serverId) {
          serverId = key;
          connection.close();
        }
      });
      this.connections.delete(serverId);
      return sessionId;
    } catch (error) {
      throw Error('Connection Close Error');
    }
  }

  /**
   * @description Remove Connection
   * @param sessionId
   * @returns sessionId
   */
  removeConnectionBySessionId(sessionId) {
    const connection = this.connections.get(sessionId);
    connection && connection.close();
    this.connections.delete(sessionId);
    return sessionId;
  }

  /**
   * @description Get Connection
   * @param sessionId
   * @returns {ConnectionPool} connection
   */
  getConnection(sessionId: string) {
    return this.connections.get(sessionId);
  }

  /**
   * @description Get Connections
   *              if payload value is null, return all connections
   *              and if payload value is not null, return connection by sessionId
   *              kor: 커넥션 리스트 가져오기
   *              payload 값이 null이면 모든 커넥션을 반환하고 payload 값이 null이 아니면 sessionId로 커넥션을 반환
   * @param {
   * sessionId: string
   * }payload
   * @returns {Map<string, ConnectionPool> | ConnectionPool} connection
   */
  getConnections(payload) {
    if (payload) {
      const { sessionId } = payload;
      const connection = this.connections.get(sessionId);
      return connection;
    } else {
      return this.connections;
    }
  }
}
