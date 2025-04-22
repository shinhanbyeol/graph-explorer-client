import { useRegisterEvents, useSigma } from '@react-sigma/core';
import { useEffect, useState } from 'react';

const MouseEvent = ({
  setSelectedObjects,
}: {
  setSelectedObjects: (nodeOrEdge: string[]) => void;
}) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [dragElements, setDragElements] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    registerEvents({
      downNode: (e) => {
        setDragElements(e.node);
        setIsDragging(true);
      },
      upNode: (e) => {
        setDragElements(null);
        setIsDragging(false);
      },
      upEdge: (e) => {},
      mouseup: (e) => {
        if (dragElements) {
          setDragElements(null);
          setIsDragging(false);
        }
      },
      mousedown: (e) => {
        // Disable the autoscale at the first down interaction
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
      mousemove: (e) => {
        if (dragElements !== null && isDragging) {
          const graph = sigma.getGraph();
          const pos = sigma.viewportToGraph(e);
          graph?.setNodeAttribute(dragElements, 'x', pos.x);
          graph?.setNodeAttribute(dragElements, 'y', pos.y);
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        }
      },
      doubleClickNode: (e) => {
        setSelectedObjects([e.node]);
      },
      doubleClickEdge: (e) => {
        setSelectedObjects([e.edge]);
      },
      clickStage: (e) => {
        setSelectedObjects([]);
      },
    });
  }, [dragElements, isDragging, sigma, setDragElements, setIsDragging]);

  return <></>;
};

export default MouseEvent;
