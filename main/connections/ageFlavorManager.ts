import ageSqls, { type Sqls } from './sql/AGE/sqls';
import agensgraphSqls from './sql/AGENSGRAPH/sqls';
import { AGE_FLAVOR } from './enum';

/**
 * @description Get SQL Query
 * @param {string} name  // filename
 * @param {AGE_FLAVOR} type
 * @param {string}version
 * @returns {string} sql
 */
function getQuery(name: keyof Sqls, type: AGE_FLAVOR, version: string) {
  if (type == null) {
    console.error('Connection Type is not defined.');
    throw Error('Connection Type is not defined');
  }
  if (version == null) {
    console.error('Flavor manager error: AGE Version is not defined');
    throw Error('AGE Version is not defined');
  }
  switch (type) {
    case AGE_FLAVOR.AGE:
      return ageSqls[version][name];
    case AGE_FLAVOR.AGENSGRAPH:
      return agensgraphSqls[version][name];
    default:
      return '';
  }
}

export { getQuery };
