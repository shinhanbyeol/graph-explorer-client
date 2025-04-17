import { types as pgTypes, Pool as PgPool } from 'pg';
import { Pool as AgensPool } from 'node-agens-pg';
import { setAGETypes } from 'node-age-pg';
import { getQuery } from './ageFlavorManager';
import { AGE_FLAVOR } from './enum';


const AGE_LATEST_VERSION = process.env.AGE_LATEST_VERSION;
const AGENSGRAPH_LATEST_VERSION = process.env.AGENSGRAPH_LATEST_VERSION;

class ConnectionPool {
  config;
  pool: PgPool | AgensPool = null;
  type: AGE_FLAVOR;
  version: string;
  sqls;
  constructor(config = null, type: AGE_FLAVOR = null, version = null) {
    switch (type) {
      case AGE_FLAVOR.AGE:
        this.pool = new PgPool(config);
        break;
      case AGE_FLAVOR.AGENSGRAPH:
        this.pool = new AgensPool(config);
        break;
      default:
        console.warn('Connection Type is not defined. set AGE as default.');
        this.pool = new PgPool(config);
    }
    this.config = config;

    if (type == null) {
      console.warn('Connection Type is not defined. set AGE as default.');
    }
    this.type = type || AGE_FLAVOR.AGE;

    if (this.version == null) {
      if (type === AGE_FLAVOR.AGE) {
        console.warn('AGE Version is not defined. set latest as default.');
        this.version = version || AGE_LATEST_VERSION;
      }
      if (type === AGE_FLAVOR.AGENSGRAPH) {
        console.warn(
          'AgensGraph Version is not defined. set latest as default.',
        );
        this.version = version || AGENSGRAPH_LATEST_VERSION;
      }
    }

    this.sqls = {
      metaNode: getQuery('nodes', this.type, this.version),
      metaEdge: getQuery('edges', this.type, this.version),
      metaProperty: getQuery('properties', this.type, this.version),
      graphs: getQuery('graphs', this.type, this.version),
    };

    // error handling
    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      client.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    });
  }

  /**
   * @description Test Connection
   * @returns {
   * success: boolean,
   * error: boolean,
   * message: string,
   * stack: string | null
   * }
   */
  async testConnection() {
    let success = {
      success: true,
      error: false,
      message: 'Connection Success',
      stack: null,
    };
    try {
      const client = await this.pool.connect();
      await client.query('select 1');
      await client.release();
    } catch (error) {
      return {
        success: false,
        error: true,
        message: error.message,
        stack: error.stack,
      };
    }
    return success;
  }

  /**
   * @description Get Connection
   * @param {string} scheme
   * @returns {PoolClient} client
   */
  async getConnection(scheme?: string) {
    if (this.pool === null) return null;
    const client = await this.pool.connect();
    if (scheme && this.type === AGE_FLAVOR.AGE) {
      await setAGETypes(client, pgTypes as any);
      await client.query(`SET search_path = ag_catalog, "$user", public;`);
    }
    if (scheme && this.type === AGE_FLAVOR.AGENSGRAPH) {
      await client.query(
        `set graph_path = ${scheme}; SET search_path = ag_catalog, "$user", public;`,
      );
    }

    return client;
  }

  /**
   * @description Release Connection
   * @param {PoolClient} client
   * @returns {void}
   */
  async release(client) {
    if (client) await client.release();
  }

  /**
   * @description Get Metadata
   * @param {string} graph
   * @returns {
   * nodeMeta: { [label: string]: number },
   * edgeMeta: { [label: string]: number },
   * propertyMeta: { [key: string]: string }
   * }
   */
  async getMetadata(graph: string) {
    const client = await this.getConnection(graph);
    let nodes = null;
    let edges = null;
    let properties = null;
    try {
      nodes = await client.query(this.sqls.metaNode);
      edges = await client.query(this.sqls.metaEdge);
      properties = await client.query(this.sqls.metaProperty);
      this.release(client);
    } catch (error) {
      console.log(error);
      this.release(client);
      return error;
    }
    const nodeMeta = {};
    const edgeMeta = {};
    const propertyMeta = {};

    nodes.rows.forEach((row) => {
      nodeMeta[row.label] = row.cnt;
    });
    edges.rows.forEach((row) => {
      edgeMeta[row.label] = row.cnt;
    });
    properties.rows.forEach((row) => {
      propertyMeta[row.key] = row.key_type;
    });

    return {
      nodeMeta,
      edgeMeta,
      propertyMeta,
    };
  }

  /**
   * @description Execute Query
   * @param {string} query
   * @param {string} graph
   */
  async excuteQuery(query: string, graph: string) {
    const client = await this.getConnection(graph);
    let result = null;
    try {
      result = await client.query(query);
      this.release(client);
    } catch (error) {
      this.release(client);
      throw error;
    }
    return result;
  }

  /**
   * @description Execute Query with Params
   * @param {string} query
   * @param {Array<any>} params
   */
  async excuteQueryWithParams(query: string, params: Array<any>) {
    const client = await this.getConnection();
    let res = null;
    try {
      res = await client.query(query, params);
      this.release(client);
    } catch (error) {
      console.log(error);
      this.release(client);
      return error;
    }
    return res;
  }

  /**
   * @description Get graph paths
   * @returns {Array<string>}
   */
  async getGraphPaths() {
    const client = await this.getConnection();
    let res = null;
    try {
      res = await client.query(this.sqls.graphs);
      this.release(client);
    } catch (error) {
      console.log(error);
      this.release(client);
      return error;
    }
    return res.rows.map((row) => row.nspname);
  }

  /**
   * @description Execute Cypher Query
   * @param {string} query
   * @param {string[]} params
   * @param {string} graph
   */
  async excuteCypherWithParams(query: string, params: string[], graph: string) {
    const client = await this.getConnection(graph);
    let res = null;
    try {
      res = await client.query(query, params);
      this.release(client);
    } catch (error) {
      console.log(error);
      this.release(client);
      return error;
    }
    return res;
  }

  async close() {
    await this.pool.end();
  }
}

export default ConnectionPool;
