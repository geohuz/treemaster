import ELK from 'elkjs'
import appStore from '../../stores/store'

export const applyLayout = async(nodes, edges, direction = 'DOWN', leafRearrange=null) => {

  const subGraphDirection = direction==="DOWN"? "RIGHT" : "DOWN"

  const elk = new ELK()

  let copyOfNodes = [...nodes]

  copyOfNodes.forEach(node => {
    if (node.ctype==="group") {
      node.children = []
      node.edges = []
      node.layoutOptions = {
        "elk.direction": subGraphDirection,
        // "hierarchyHandling": "INCLUDE_CHILDREN",
        // "elk.hypernode": true,
        // 非常重要的属性: 保证subgraph不会做整体padding
        // https://rtsys.informatik.uni-kiel.de/elklive/examples.html?e=general%2Fspacing%2Fpadding
        "elk.padding": "[top=0,left=0,bottom=0,right=0]",
        // "elk.spacing.nodeNode": 5,
        // "elk.spacing.edgeNode": 2,
        // "elk.hypernode": true,
        // "considerModelOrder.strategy": "PREFER_NODES",
        // "elk.nodeSize.fixedGraphSize": true,
        // "elk.hierarchyHandling": "SEPARATE_CHILDREN",
        // "elk.hypernode": true,
        // "elk.spacing.labelNode": 0,
        // "elk.spacing.nodeNode": 0,
        // "elk.spacing.portPort": 0,
        // "topdown.hierarchicalNodeWidth": 200,
        // "elk.topdownLayout": true
        // "elk.algorithm": "fixed",
      }
    }
    if (node.parentNode) {
      let pNode = copyOfNodes.filter(nnode=>nnode.id===node.parentNode)[0]
      pNode.children.push(node)
      copyOfNodes = copyOfNodes.filter(nnode=>nnode.id!==node.id)
    } 
  })

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": 'layered',
      "layering.strategy": "BF_MODEL_ORDER",
      "elk.direction": direction,
      "nodePlacement.strategy": "BRANDES_KOEPF",  // 父节点对于子节点的跨度位置以及子节点分割.
      "spacing.edgeNodeBetweenLayers": appStore.layerSpacing,
       //"spacing.nodeNode": 20,
      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED', // 父节点居中
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true', // 自动减少跨线并保持节点次序
      'considerModelOrder.strategy': 'NODES_AND_EDGES'
      // 'portConstraints': 'FIXED_ORDER'
    },
    // layoutOptions: {
    //   "elk.algorithm": 'force'
    // },
    children: copyOfNodes,
    edges: edges,
  }

  let result = await elk.layout(graph)
  let recoverNodes = []
  // 不需要递归, 因为是扁平数据
  result.children.forEach(item=> {
    if (item.children) {
      const {children, ...rest} = item
      recoverNodes.push(rest)
      item.children.forEach(iitem=> recoverNodes.push(iitem))
    } else {
      recoverNodes.push(item)
    }
  })

  nodes = recoverNodes
  edges = result.edges

  // update nodes edges for different layout
  nodes.forEach(node => {
    const nodeWithPosition = node
    // make sure the width/height style get changed
    if (node.type==="SubgraphContainer") {
      node.style = {...node.style, ...{width: node.width, height: node.height}}
    }
    if (node.hasOwnProperty('parentNode')) {
      // 右向布局且是组元素: source(出向): bottom, target(进向)top
      // 下向布局且是组元素：source: right, target: left
      node.targetPosition = direction==="RIGHT"? 'top' : 'left'
      node.sourcePosition = direction==="RIGHT"? 'bottom'  : 'right'
    } else {
      // 右向布局不是组元素: source: right, target: left
      // 下向布局不是组元素: source: bottom, target: top
      node.targetPosition = direction==="RIGHT"? 'left' : 'top'
      node.sourcePosition = direction==="RIGHT" ? 'right': 'bottom'
    }

    node.position = {
      x: nodeWithPosition.x,
      y: nodeWithPosition.y
    };

  });

  edges.forEach(edge=> {
    let edgeNodeSource = nodes.filter(node=>node.id === edge.source)[0]
    let edgeNodeTarget = nodes.filter(node=>node.id === edge.target)[0]
    if (edgeNodeSource.parentNode || edgeNodeTarget.parentNode) {
      edge.sourceHandle = direction === "RIGHT"? "sb" : "sr"
      edge.targetHandle = direction === "RIGHT"? "tt" : "tl"
    } else {
      edge.sourceHandle = direction==="RIGHT"? "sr" : "sb"
      edge.targetHandle = direction==="RIGHT"? "tl" : "tt"
    }
  })

  return new Promise((resolve, reject) => {
    resolve ({ nodes, edges });
  })};

