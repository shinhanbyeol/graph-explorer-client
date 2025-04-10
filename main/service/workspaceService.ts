import path from 'path';
import { convertKeysToCamelCase } from '../util/snakeToCamel';
import { _Workspace, Workspace } from './types/common';
import { v4 as uuidv4 } from 'uuid';
import { fileWrite } from './fileService';

export default class WorkspaceService {
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
   * @description Get workspace by id
   * @param {String} id
   * @returns {Workspace} workspace
   * @memberof WorkspaceService
   */
  async getWorkspace(id: string): Promise<Workspace> {
    const workspace = (await this._sqlitePromise(
      `SELECT * FROM tb_workspaces WHERE id = ?`,
      [id],
    )) as _Workspace;
    return convertKeysToCamelCase(workspace[0]) as Workspace;
  }

  /**
   * @description Get all workspaces by serverId and graph
   * @returns {Workspace[]} workspaces
   * @memberof WorkspaceService
   * @pram {String} serverId
   * @pram {String} graph
   */
  async getWorkspaces(serverId: number, graph: string): Promise<Workspace[]> {
    const sql = `SELECT * FROM tb_workspaces where server_id = ? and graph = ?`;
    const workspaces = (await this._sqlitePromise(sql, [
      serverId,
      graph,
    ])) as _Workspace[];
    return workspaces.map((workspace) =>
      convertKeysToCamelCase(workspace),
    ) as Workspace[];
  }

  /**
   * @description Add workspace
   * @param {
   * serverId: string,
   * graph: string,
   * name: string,
   * } newWorkspace
   * @returns {String} workspaceId
   * @memberof WorkspaceService
   */
  addWorkspace = async (
    newWorkspace: {
      serverId: number;
      graph: string;
      name: string;
    },
    cachePath: string,
  ): Promise<string> => {
    const { serverId, graph, name } = newWorkspace;
    const randomId = uuidv4();

    const sqlPath = path.join(cachePath, 'works', serverId.toString(), graph);
    const jsonPath = path.join(cachePath, 'works', serverId.toString(), graph);
    const sqlFileName = `${randomId}_${name}`;
    const jsonFileName = `${randomId}_${name}`;

    fileWrite(sqlPath, '', sqlFileName, 'sql');
    fileWrite(jsonPath, {}, jsonFileName, 'json');

    const workspaceId = await this.metaDb.run(
      `INSERT INTO tb_workspaces (server_id, graph, name, sql_path, json_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        serverId,
        graph,
        name,
        path.join(sqlPath, `${sqlFileName}.sql`),
        path.join(jsonPath, `${jsonFileName}.json`),
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );

    return workspaceId;
  };
}
