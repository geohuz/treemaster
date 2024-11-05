import { memo, useCallback } from 'react';
import { Handle,  useReactFlow,  
        Position, useStore, useNodeId, NodeToolbar } from 'reactflow';
import {nodeVSpacing, nodeHSpacing, 
  default_node_dim, 
  dirMatrix } from './global.js'
import {getTreeDirectionHandles, getNewEdge, randomNumber } from './utils'
// import {getId} from './CNode'
import appStore from '../../stores/store'
import {observer} from 'mobx-react-lite'

import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

const SubgraphContainer = observer((data) => {
  const reactFlowInstance = useReactFlow()
  // const myself = useStore( s => {
  //   const nodeId = useNodeId()
  //   return s.nodeInternals.get(nodeId)
  // })
  let myself = reactFlowInstance.getNode(data.id)

  const addNode = useCallback(
    (dir) => {
    let id =  appStore.getId()
    //let myself = reactFlowInstance.getNode(data.id)
    let newNodePosition =  {}
    let dirHdl = getTreeDirectionHandles(appStore.treeDirection)[dir]
    let newEdge = getNewEdge(id, myself.id, id, dirHdl, appStore.treeDirection, dir)

    switch (dir) {
      case "Top":
          newNodePosition.x = myself.position.x + randomNumber(-100, 100) 
          newNodePosition.y = myself.position.y - myself.height - nodeVSpacing
        break
      case "Bottom":
          newNodePosition.x = myself.position.x + randomNumber(-100, 100) 
          newNodePosition.y = myself.position.y + myself.height + nodeVSpacing
        break
      case "Left":
          newNodePosition.x = myself.position.x - myself.width - nodeHSpacing
          newNodePosition.y = myself.position.y + randomNumber(-100, 100) 
        break
      case "Right":
          newNodePosition.x = myself.position.x + myself.width + nodeHSpacing
          newNodePosition.y = myself.position.y + randomNumber(-100, 100) 
        break
      }

    const newNode = {
      id,
      data: {label: `Node ${id}`},
      type: 'CNode',
      position: newNodePosition,
      targetPosition: dirHdl.tgt,
    }

    appStore.addTreeNode(newNode.id, {label: newNode.data.label})
    myself.sourcePosition = dirHdl.src
    reactFlowInstance.addNodes(newNode)
    reactFlowInstance.addEdges(newEdge)
  }, [myself])

  const handleStyle = appStore.editMode? {minWidth: 8, minHeight: 8} : {minWidth: 1, minHeight: 1}

  return (
    <div>
      {appStore.editMode  && appStore.treeDirection==="DOWN" && 
      <>
        <NodeToolbar
          key="top"
          position="top"
        >
          <AddBoxOutlinedIcon 
            style={{cursor: "pointer"}}
            onClick={()=>addNode("Top")}
            size="small" 
          />
        </NodeToolbar>
        <NodeToolbar
          key="bottom"
          position="bottom"
        >
          <AddBoxOutlinedIcon 
            style={{cursor: "pointer"}}
            onClick={()=>addNode("Bottom")}
            size="small" 
          />
        </NodeToolbar>
      </>
      }
      {appStore.editMode && appStore.treeDirection==="RIGHT" && 
      <>
        <NodeToolbar
          key="left"
          position="left"
        >
          <AddBoxOutlinedIcon 
            style={{cursor: "pointer"}}
            onClick={()=>addNode("Left")}
            size="small" 
          />
        </NodeToolbar>
        <NodeToolbar
          key="right"
          position="right"
        >
          <AddBoxOutlinedIcon 
            style={{cursor: "pointer"}}
            onClick={()=>addNode("Right")}
            size="small" 
          />
        </NodeToolbar>
      </>
      }
    <Handle style={handleStyle} type="target" position={Position.Top}  id="tt" />
    <Handle style={handleStyle} type="target" position={Position.Bottom} id="tb"/>
    <Handle style={handleStyle} type="source" position={Position.Top} id="st"/>
    <Handle style={handleStyle} type="source" position={Position.Bottom} id="sb"/>

    <Handle style={handleStyle} type="target" position={Position.Left} id="tl"/>
    <Handle style={handleStyle} type="target" position={Position.Right} id="tr"/>
    <Handle style={handleStyle} type="source" position={Position.Left} id="sl"/>
    <Handle style={handleStyle} type="source" position={Position.Right} id="sr"/>
    </div>
  );
});

export default memo(SubgraphContainer);
