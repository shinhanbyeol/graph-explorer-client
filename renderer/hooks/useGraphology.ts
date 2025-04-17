import { MultiDirectedGraph } from 'graphology';
import { useGraphologyStore } from '../stores/graphologyStore';
import { useCallback } from 'react';
import { Attributes } from 'graphology-types';

export type Vertex = {
  key: string;
  id: string;
  label: string;
  properties: {
    [keys: string]: any;
  };
};

export type Edge = {
  key: string;
  id: string;
  label: string;
  source: string;
  target: string;
  properties: {
    [keys: string]: any;
  };
};

export type GraphData = {
  nodes: Vertex[];
  edges: Edge[];
};

type _Graphology = MultiDirectedGraph<Attributes, Attributes, Attributes>;

const useGraphology = () => {
  const { initGraphology, updateGraphology } = useGraphologyStore();

  /**
   * @description Initialize graphology instance
   * @returns {void}
   */
  const init = useCallback(
    (workSpaceName: string, graphname: string, serverId: number) => {
      const g = new MultiDirectedGraph({
        allowSelfLoops: true,
      });
      g.setAttribute('workspace', workSpaceName);
      g.setAttribute('graph', graphname);
      g.setAttribute('serverId', serverId);
      initGraphology(g);
    },
    [initGraphology],
  );

  /**
   * @description Import graphology data
   * @param {GraphData} data
   * @returns {void}
   */
  const importGraphologyData = useCallback(
    (graphology: _Graphology, data: GraphData) => {
      if (!graphology) return;
      graphology.clear();
      data.nodes.forEach((node) => {
        graphology.mergeNode(node.key, {
          id: node.id,
          label: node.label,
          properties: node.properties,
          x: 0,
          y: 0,
        });
      });
      data.edges.forEach((edge) => {
        graphology.mergeEdgeWithKey(edge.key, edge.source, edge.target, {
          id: edge.id,
          type: 'arrow',
          label: edge.label,
          properties: edge.properties,
        });
      });
      updateGraphology(graphology);
    },
    [updateGraphology],
  );

  return {
    init,
    importGraphologyData,
  };
};

export default useGraphology;
