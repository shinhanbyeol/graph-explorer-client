import { _Server } from './types/common';
import { AGE_FLAVOR } from '../connections/enum';
import { convertKeysToCamelCase } from '../util/snakeToCamel';

export default class ServerService {
  metaDb;
  _sqlitePromise;

  constructor(metaDb) {
    this.metaDb = metaDb; // sqlite3 instances
    this._sqlitePromise = (sql, params) => {
      return new Promise((resolve, reject) => {
        this.metaDb.prepare(sql).all(params, (err, rows) => {
          if (err) {
            reject(err);
            throw err;
          }
          resolve(rows);
        });
      });
    };
  }

  /**
   * @returns
   * @memberof ServerService
   */
  async getServers(): Promise<ServerResponse[]> {
    const sql = `SELECT * FROM tb_servers`;
    const servers = (await this._sqlitePromise(sql, [])) as _Server[];
    return servers.map((server) =>
      convertKeysToCamelCase(server),
    ) as ServerResponse[];
  }

  /**
   *
   * @param {*} serverId
   * @returns
   * @memberof ServerService
   */
  async getServer(serverId): Promise<ServerResponse> {
    const server = (await this._sqlitePromise(
      `SELECT * FROM tb_servers WHERE id = ?`,
      [serverId],
    )) as _Server;
    return convertKeysToCamelCase(server[0]) as ServerResponse;
  }

  /**
   * @param {*} server
   * @returns
   * @memberof ServerService
   */
  addServer = async (server: {
    name: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    serverType?: AGE_FLAVOR;
    version?: string;
  }) => {
    const { name, host, port, database, user, password, serverType, version } =
      server;
    const serverId = await this.metaDb.run(
      `INSERT INTO tb_servers 
      (name, host, port, database, user, password, server_type, version, created_at, updated_at)
        VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        host,
        port,
        database,
        user,
        password,
        serverType,
        version,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
      (err) => {
        if (err) {
          console.error(err);
          throw err;
        }
      },
    );
    return serverId;
  };

  /**
   * @param {*} serverId
   * @returns
   * @memberof ServerService
   */
  removeServer = async (serverId) => {
    await this.metaDb.run(
      `DELETE FROM tb_servers WHERE id = ?`,
      [serverId],
      (err) => {
        if (err) {
          throw err;
        }
      },
    );
  };

  /**
   * @param {*} server
   * @returns
   * @memberof ServerService
   */
  updateServer = async (server) => {
    const { id, name, host, port, user, password, serverType, version } =
      server;
    await this.metaDb.run(
      `UPDATE tb_servers SET name = ?, host = ?, port = ?, user = ?, password = ?, server_type = ?, version = ?, updated_at = ?  WHERE id = ?`,
      [
        name,
        host,
        port,
        user,
        password,
        serverType,
        version,
        new Date().toISOString(),
        id,
      ],
      (err) => {
        if (err) {
          throw err;
        }
      },
    );
  };
}
