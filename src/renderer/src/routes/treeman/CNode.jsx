import { memo, useCallback, useEffect, Fragment } from 'react';
import { Handle,  useReactFlow, Position, useStore, useNodeId, 
  NodeToolbar } from 'reactflow';
import { genNewNodePos, getNewEdge, getTreeDirectionHandles } from './utils'
import { rf_global, default_node_dim, 
       nodeHSpacing, nodeVSpacing, dirMatrix, 
} from './global.js'
import appStore from '../../stores/store'
import {observer} from 'mobx-react-lite'
import CraftNode from '../../components/CraftNode'
import IconButton from '@mui/material/IconButton';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import { useSpring, useSpringRef, animated } from '@react-spring/web'
import {reaction} from 'mobx'
import { ConstructionOutlined } from '@mui/icons-material';

const AnimatedCraftNode = animated(CraftNode)

const lowerFirst = (phrase) => phrase.charAt(0).toLowerCase() + phrase.slice(1)

//let id = 1;
//export const getId = () => `${id++}`;

const CNode = observer((data) => {
  const handleClick = useCallback(() => {
    //  非常重要！！！
    if (!appStore.editMode) {
      appStore.setCollapseNodes(data.id)
    }
  })

  const reactFlowInstance = useReactFlow()

  const api = useSpringRef()

  // 节点动画
  let disposer = reaction(
    ()=>([appStore.treeNodes[data.id]?.target, appStore.treeNodes[data.id]?.folded]),
    ([target, folded]) => {
      let offsetX, offsetY
        if (folded) {
          // 折叠
          offsetX = reactFlowInstance.getNode(target).position.x - data.xPos
          offsetY = reactFlowInstance.getNode(target).position.y - data.yPos
        } else {
          // 展开
          offsetX = 0
          offsetY = 0
        }
        api.start({
          config: {
            friction: 20,
            tension: 210
          },
          to: {
            x: offsetX,
            y: offsetY
          },
          onStart: () => !folded && reactFlowInstance.setNodes(nds=> {
            let c_nds= [...nds]
            for (const node of c_nds) {
              if (node.id ===data.id && node.id!== target) {
                node.style = {...node.style, ...{pointerEvents: "all", opacity: 1}}
                break
              }
            }
            return c_nds
          }),
          onRest: (a, b, item) => folded && reactFlowInstance.setNodes(nds=> {
            let c_nds= [...nds]
            for (const node of c_nds) {
              if (node.id ===data.id && node.id!== target) {
                // 所有折叠节点停止鼠标交互， 透明度为0, 以防止click away issue
                node.style ={...node.style, ...{pointerEvents: "none", opacity: 0}}
                break
              }
            }
            return c_nds
          })
        })
      }
  )

  const springs = useSpring({
    ref: api,
    from: {x: 0, y: 0},
  })

  useEffect(()=> {
    return () => disposer()
  }, [])

  const addNode = useCallback(
    (dir) => {
    let id =  appStore.getId()
    let myself = reactFlowInstance.getNode(appStore.selectedNodeId)
    let container
    if (myself.parentNode) {
      container = reactFlowInstance.getNodes()
        .filter(item=>item.id === myself.parentNode)[0]
    }

    let newNodePosition =  {}
    let width, height, siblingStartX, siblingStartY
    let dirHdl = getTreeDirectionHandles(appStore.treeDirection)[dir]
    let newEdge = getNewEdge(id, myself.id, id, dirHdl, appStore.treeDirection, dir, 'CEdge')
    switch (dir) {
      case "Top":
          newNodePosition.x = genNewNodePos(myself.position.x, myself.width)
          newNodePosition.y = myself.position.y - myself.height - nodeVSpacing
        break
      case "Bottom":
          newNodePosition.x = genNewNodePos(myself.position.x, myself.width)
          newNodePosition.y = myself.position.y + myself.height + nodeVSpacing
        break
      case "Right":
          newNodePosition.x = myself.position.x + myself.width + nodeHSpacing
          newNodePosition.y = genNewNodePos(myself.position.y, myself.height)
        break
      case "Left":
          newNodePosition.x = myself.position.x - myself.width - nodeHSpacing
          newNodePosition.y = genNewNodePos(myself.position.y, myself.height)

        break
      // case "sibling":
      //     switch (appStore.treeDirection) {
      //       case "DOWN":
      //         siblingStartX = myself.position.x
      //         if (!myself.parentNode) {
      //           width = myself.width + nodeHSpacing
      //         } else {
      //           width = container.width + nodeHSpacing
      //         }
      //         newNodePosition.x = siblingStartX + width
      //         newNodePosition.y = myself.position.y
      //       break
      //       case "RIGHT":
      //         siblingStartY = myself.position.y
      //         if (!myself.parentNode) {
      //           height = myself.height + nodeVSpacing
      //         } else {
      //           height = container.height + nodeVSpacing
      //         }
      //         newNodePosition.x = myself.position.x
      //         newNodePosition.y = siblingStartY + height
      //       break
      //     }
      //   break
    }

    const newNode = {
      id,
      data: {label: `Node ${id}`},
      type: 'CNode',
      position: newNodePosition,
      sourcePosition: dirHdl.src,
      targetPosition: dirHdl.tgt,
    }

    // clone data to the new node
    if (appStore.cloneMode) {
      appStore.addTreeNode(newNode.id, {stateData: appStore.selectedNode.stateData})
    } else {
      appStore.addTreeNode(newNode.id, {label: newNode.data.label})
    }

    reactFlowInstance.setNodes(nds=> {
      let data = [...nds]
      if (dir==="sibling") {
        if (!myself.parentNode) {
          let newWidth, newHeight, container, newX, newY
          switch (appStore.treeDirection) {
            case "DOWN":
              newWidth = myself.width + default_node_dim.width + nodeHSpacing 
              container = createCompoundNode(myself.position.x, myself.position.y, 
                                    [myself.id, newNode.id], newWidth, myself.height)
              newY = 0
              newX = myself.width + nodeHSpacing
              break
            case "RIGHT":
              newHeight = myself.height + default_node_dim.height + nodeVSpacing 
              container = createCompoundNode(myself.position.x, myself.position.y, 
                                    [myself.id, newNode.id], myself.width, newHeight)
              newY = myself.height + nodeVSpacing
              newX = 0
              break
          }

          // container.maxDim = {...container.maxDim,
          //         ...{width: newNode.width > myself.width ? newNode.width : myself.width, 
          //             height: newNode.height > myself.height? newNode.height : myself.height
          //         }} 
            
          data.unshift(container)

          myself.parentNode = container.id
          // need to limit the node movement within the container
          // has to draggable to enable dragging inside craftnode
          myself.extent = "parent"
          myself.draggable = true 
          myself.connectable = false
          myself.position.x = 0
          myself.position.y = 0
          
          newNode.parentNode = container.id
          newNode.extent = "parent"
          newNode.draggable = true
          newNode.connectable = false
          newNode.position.y = newY
          newNode.position.x = newX

          appStore.updateTreeNodeTree(myself.id, 
            {parentNode: container.id})
          appStore.updateTreeNodeTree(newNode.id, 
            {parentNode: container.id})

          appStore.addTreeNode(container.id, {label: null, children: container._children})

          // 改变首个group节点的edge, target->container, container->target
          reactFlowInstance.setEdges(eds => {
              let data = [...eds]
              data.forEach(edge => {
                if (edge.target === myself.id) {
                  edge.target = myself.parentNode
                }
                if (edge.source === myself.id) {
                  edge.source = myself.parentNode
                }
              })
              return data
          })
        } else {
          let containerId
          // let containerLastNodeId = container._children[container._children.length - 1]
            // update maxDim
            // if (node.id === containerLastNodeId) {
            //   container.maxDim = {...container.maxDim, 
            //       ...{width: newNode.width > node.width ? newNode.width : node.width, 
            //           height: newNode.height > node.height? newNode.height : node.height
            //       }} 
            // }
          for (const node of data) {
            if (node.id === myself.parentNode) {
              let newContainerWidth, newContainerHeight
              switch (appStore.treeDirection) {
                case "DOWN":
                  newContainerWidth = node.width + default_node_dim.width + nodeHSpacing 
                  node.width = newContainerWidth
                  node.style = {...node.style, width: newContainerWidth}
                  break
                case "RIGHT":
                  newContainerHeight = node.height + default_node_dim.height + nodeVSpacing 
                  node.height = newContainerHeight
                  node.style = {...node.style, height: newContainerHeight}
                  break
              }
              node._children.push(newNode.id)
              containerId = node.id
              appStore.updateTreeNodeTree(newNode.id, 
                {parentNode: container.id})
              appStore.updateTreeNodeTree(node.id, {children: node._children})
              break
            }
          }

          newNode.extent = "parent"
          newNode.draggable = true
          newNode.connectable = false
          newNode.parentNode = containerId
        }
      }
      myself.sourcePosition = dirHdl.src
      myself.targetPosition = dirHdl.tgt
      let merged = data.concat(newNode)
      return merged
    })

    // if (dir==="sibling" && container) {
    //   let linkPair = container._children.slice(-2)
    //   newEdge = {...newEdge, ...{source: linkPair[0], target: linkPair[1]}}
    // }

    reactFlowInstance.addEdges(newEdge)

  }, [])

  useEffect(() => {
    return () => {
      // console.log("unmount in cnode")
      document
        ?.querySelector('.craftjsRenderer')
        ?.removeEventListener('scroll', scroll);
    };
  }, []);


  return (
    <>
      {appStore.editMode ? 
        <>
          {!appStore.selectedNode?.parentNode && <NodeToolbars buttonGroup={"buttonNorm"} callBack={addNode} />}
          {(appStore.siblingNode && 
            (!appStore.selectedNode?.parentNode|| appStore.treeNodes[appStore.selectedNode?.parentNode].children[0] === appStore.selectedNodeId)) && 
            <NodeToolbars buttonGroup={"buttonSib"} callBack={addNode}/>}
        </>
        : null
      }
      {!appStore.editMode?
        <animated.div onClick={handleClick} style={{...springs}}>
          <CraftNode treeNode={data} />
        </animated.div>
        :
        <CraftNode treeNode={data} />
      }
      <Handles matrix={dirMatrix} 
        treeDir={appStore.treeDirection} 
        parentNode={appStore.treeNodes[data.id]?.parentNode} />
    </>
  )
})

const Handles = observer(
  ({matrix, treeDir, parentNode}) => {
  let elements = []
  let handleNorms = matrix[treeDir]['handleNorm']
  let handleSibs = matrix[treeDir]['handleSib']

  const handleStyle = appStore.editMode? {minWidth: 8, minHeight: 8} : {minWidth: 1, minHeight: 1}

  if (!parentNode) {
    handleNorms.forEach(dir=> {
      let firstChar = `${dir.charAt(0).toLowerCase()}`
      elements.push(
        [ <Handle key={`t${firstChar}`} style={handleStyle}  type="target" 
            position={Position[dir]} id={`t${firstChar}`} /> ,
          <Handle key={`s${firstChar}`} style={handleStyle} type="source" 
            position={Position[dir]} id={`s${firstChar}`} />
        ]
      )
    })
  }

  handleSibs.forEach(dir=> {
      let firstChar = `${dir.charAt(0).toLowerCase()}`
      elements.push(
        [ <Handle key={`t${firstChar}`} style={handleStyle} type="target" 
          position={Position[dir]} id={`t${firstChar}`} /> ,
          <Handle key={`s${firstChar}`} style={handleStyle} type="source" 
            position={Position[dir]} id={`s${firstChar}`} />
        ]
      )
  })

  return elements
})

const NodeToolbars = observer(({buttonGroup, callBack}) => {
  let dirs = dirMatrix[appStore.treeDirection][buttonGroup]
  return (
    dirs.map(item=> {
      let pos = item==="sibling"?  dirMatrix[appStore.treeDirection].sibling : item
      return (
        <NodeToolbar key={item} position={lowerFirst(pos)}>
          {/* mui IconButton 有 bug, 如果套着IconButton来回drag会maxDepth */}
          <AddBoxOutlinedIcon 
              color="secondary"
              style={{cursor: "pointer"}}
              onClick={()=>callBack(item)} 
              size="small" 
          />
        </NodeToolbar>
      )}
      )
  )
})

const createCompoundNode = (x, y, children, width, height)  => {
  return {
    _children: children,
    //may be we can save some space for using shorter id string
    //id: crypto.randomUUID(),
    id: appStore.getId(),
    type: "SubgraphContainer",
    ctype: "group",
    data: {label: null},
    position: {x: x, y: y},
    width: width,
    height: height,
    draggable: true,
    style: {
      border: "1px dashed",
      borderRadius: "4px",
      width: width,
      height: height
    }
  }
}



const CondWrapper = ({ children, condition, wrapper }) => {
  return condition ? wrapper(children) : children
}

export default memo(CNode);