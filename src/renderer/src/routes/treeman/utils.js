import { Position, internalsSymbol } from 'reactflow';
import { dirMatrix, rf_global} from './global'
import appStore from '../../stores/store'

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA, nodeB) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getHandleCoordsByPosition(node, handlePosition) {
  // all handles are from type source, that's why we use handleBounds.source here
  const handle = node[internalsSymbol].handleBounds.source.find(
    (h) => h.position === handlePosition
  );

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

function getNodeCenter(node) {
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) 
// you need to create an edge
export function getEdgeParams(source, target) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}

export function genNewNodePos(pos, width) {
  let posXs = range(pos-(2*width), pos+(2*width), 4)
  let posXsExcludeWidth = posXs.filter(xx=> !(xx>pos - width - 5 && xx<pos +  width + 5))
  let randomIdx = randomNumber(0, posXsExcludeWidth.length-1)
  return posXsExcludeWidth[randomIdx]
}

export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export function replaceChar(string, index, replacement) {
  return string.slice(0, index) + replacement + string.slice(index + 1);
}


export function getTreeDirectionHandles(treeDir) {
    let copy = JSON.parse(JSON.stringify(dirMatrix))
    let dirHdl = {...copy.handles, 
      sibling: copy.handles[copy[treeDir].sibling]}

    let reverseHandle = dirHdl[copy[treeDir].reverse]
    reverseHandle.sh = replaceChar(reverseHandle.sh, 0, 't')
    reverseHandle.th = replaceChar(reverseHandle.th, 0, 's')
    return dirHdl 
}

// handles: dirMarix handles with sibling
export function getNewEdge(id, sourceId, targetId, handles, treeDir, portDir, type) {
  let newEdge = {id, source: sourceId, target: targetId, 
    sourceHandle: handles.sh, targetHandle: handles.th, 
    type: type, 
    pathOptions: {offset: rf_global.pathOffset}}
  
  // 反向连接交换source/target
  if (dirMatrix[treeDir].reverse===portDir) {
    newEdge.source = targetId
    newEdge.target = sourceId
    newEdge.sourceHandle = handles.th 
    newEdge.targetHandle = handles.sh
  }
  return newEdge
}

