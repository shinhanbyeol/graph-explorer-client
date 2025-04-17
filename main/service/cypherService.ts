import { Edge } from '../../renderer/hooks/useGraphology';
import { AGE_FLAVOR } from '../connections/enum';

export default class CypherService {
  type: AGE_FLAVOR;
  labels: Set<string>;
  constructor(type) {
    this.type = type;
    this.labels = new Set();
  }
  createResult(resultSet) {
    let result;

    let targetItem = resultSet;
    if (Array.isArray(resultSet)) {
      targetItem = resultSet.pop();
    }

    let cypherRow = targetItem.rows;
    if (this.type === AGE_FLAVOR.AGE) {
      try {
        cypherRow = this._convertAGERowToResult(targetItem);
      } catch (e) {
        console.error('error: _convertAGERowToResult message: ' + e.message);
      }
    }
    if (this.type === AGE_FLAVOR.AGENSGRAPH) {
      try {
        cypherRow = this._convertAgensRowToResult(targetItem);
      } catch (e) {
        console.error('error: _convertAgensRowToResult message: ' + e.message);
      }
    }
    result = {
      result: cypherRow,
      labels: Array.from(this.labels),
      columns: this._getColumns(targetItem),
      rowCount: this._getRowCount(targetItem),
      command: this._getCommand(targetItem),
    };
    return result;
  }

  _getColumns(resultSet) {
    return resultSet?.fields?.map((field) => field.name);
  }

  _getRowCount(resultSet) {
    return resultSet?.rows?.length ?? 0;
  }

  _getCommand(resultSet) {
    return resultSet.command;
  }

  /**
   * AgensGraph Converters
   */
  _convertVertexForAgensGraph(col: AgensVertexEdge) {
    return {
      key: `${col.id.oid}.${col.id.id}`,
      id: `${col.id.oid}.${col.id.id}`,
      label: col.label,
      properties: col.props,
    };
  }

  _convertEdgeForAgensGraph(col: AgensVertexEdge) {
    return {
      key: `${col.id.oid}.${col.id.id}`,
      id: `${col.id.oid}.${col.id.id}`,
      label: col.label,
      source: `${col.start.oid}.${col.start.id}`,
      target: `${col.end.oid}.${col.end.id}`,
      properties: col.props,
    };
  }

  _convertPathForAgensGraph(col: AgensPath) {
    return {
      nodes: col.vertices.map((vertex) => {
        return {
          key: `${vertex.id.oid}.${vertex.id.id}`,
          id: `${vertex.id.oid}.${vertex.id.id}`,
          label: vertex.label,
          properties: vertex.props,
        };
      }),
      edges: col.edges.map((edge) => {
        return {
          key: `${edge.id.oid}.${edge.id.id}`,
          id: `${edge.id.oid}.${edge.id.id}`,
          label: edge.label,
          source: `${edge.start.oid}.${edge.start.id}`,
          target: `${edge.end.oid}.${edge.end.id}`,
          properties: edge.props,
        };
      }),
    };
  }

  /**
   * @description Set Summary Labels Count
   * @param {string} label
   */
  _setSummaryLabels(label: string) {
    const isAllreadySet = this.labels.has(label);
    if (!isAllreadySet) {
      this.labels.add(label);
    }
  }

  /**
   * AGE Converters
   */
  _convertVertexForAGE({ label, id, properties }) {
    return {
      node: true,
      label: label,
      id: `${id}`,
      properties: properties,
    };
  }

  _convertEdgeForAGE({ label, id, start_id, end_id, props }) {
    return {
      edge: true,
      label: label,
      id: `${id}`,
      start: `${start_id}`,
      end: `${end_id}`,
      properties: props,
    };
  }

  _convertPathForAGE({ vertices, edges }) {
    const _nodes = [];
    const _edges = [];
    // vertex
    for (let idx in vertices) {
      _nodes.push(this._convertVertexForAGE(vertices[idx]));
    }
    // edge
    for (let idx in edges) {
      _edges.push(this._convertEdgeForAGE(edges[idx]));
    }
    return {
      n: _nodes,
      e: _edges,
    };
  }

  /**
   * @description Convert AgensGraph Result to GraphData
   * @param resultSet
   * @returns {GraphData}
   */
  _convertAgensRowToResult(resultSet: AgensGraphResult): GraphData {
    const nodes = [];
    const edges = [];
    resultSet?.rows?.forEach((row) => {
      for (const [key, col] of Object.entries(row)) {
        const type = col.constructor.name;
        switch (type) {
          case 'Vertex':
            const vertex = this._convertVertexForAgensGraph(
              col as AgensVertexEdge,
            );
            this._setSummaryLabels(vertex.label);
            nodes.push(vertex);
            break;
          case 'Edge':
            const edge = this._convertEdgeForAgensGraph(col as AgensVertexEdge);
            this._setSummaryLabels(edge.label);
            edges.push(edge);
            break;
          case 'Path':
            const path = this._convertPathForAgensGraph(col as AgensPath);
            nodes.push(...path.nodes);
            edges.push(...path.edges);
            break;
          default:
            break;
        }
      }
    });
    return {
      nodes,
      edges,
    };
  }

  /**
   * @description Convert AGE Result to GraphData
   * @param resultSet
   * @returns {GraphData}
   */
  _convertAGERowToResult(resultSet): GraphData {
    const nodes: Vertex[] = [];
    const edges: Edge[] = [];

    resultSet.rows.map((row) => {
      for (let k in row) {
        if (row[k]) {
          const col = Object.fromEntries(row[k]) as any;
          let typeName: 'Vertex' | 'Edge' | 'Path' = col?.start_id
            ? 'Edge'
            : row[k].vertices
            ? 'Path'
            : 'Vertex';

          if (typeName === 'Path') {
            // map to json
            const { n, e } = this._convertPathForAGE(col);
            n.forEach((_node) => {
              this._setSummaryLabels(_node.label);
              nodes.push({
                key: _node.id,
                id: _node.id,
                label: _node.label,
                properties: _node.properties,
              });
            });
            e.forEach((_edge) => {
              this._setSummaryLabels(_edge.label);
              edges.push({
                key: _edge.id,
                id: _edge.id,
                label: _edge.label,
                source: _edge.start,
                target: _edge.end,
                properties: _edge.properties,
              });
            });
          } else if (typeName === 'Vertex') {
            const _node = this._convertVertexForAGE(col);
            this._setSummaryLabels(_node.label);
            nodes.push({
              key: _node.id,
              id: _node.id,
              label: _node.label,
              properties: _node.properties,
            });
          } else if (typeName === 'Edge') {
            const _edge = this._convertEdgeForAGE(col);
            this._setSummaryLabels(_edge.label);
            edges.push({
              key: _edge.id,
              id: _edge.id,
              label: _edge.label,
              source: _edge.start,
              target: _edge.end,
              properties: _edge.properties,
            });
          }
        }
      }
    });
    return {
      nodes,
      edges,
    };
  }
}
