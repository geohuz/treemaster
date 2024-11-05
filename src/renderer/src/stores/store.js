import { toJS, makeAutoObservable, set, get, remove, keys, entries } from "mobx"
import { configure } from "mobx"
import graphlib from '@dagrejs/graphlib'

var graph
export function populateGraph(nodes, edges) {
  graph =  new graphlib.Graph()
  //console.log("imbeeing called")
  graph.setGraph({})
  graph.setDefaultEdgeLabel(function() { return {}; });

  nodes.map(node=> {
    graph.setNode(node.id)
  })

  edges.map(edge=> {
    graph.setEdge(edge.source, edge.target)
  })

  return graph
}

export function getCollapsePaths(vs) {
  let nodes = graphlib.alg.postorder(graph, vs.toString()) 
  //console.log("nodes: ", nodes)
  if (nodes.length===1) return null 
  return {target: vs, nodes: nodes}
}

configure({
    enforceActions: "never"
})

function createTreeNode({
  parentNode=null, 
  // if children is [] then it's a normal node
  // else it is a container
  children=[], 
  stateData = {},
  craftSerializeHandler = null,
  label = "",
  // 默认都是打开状态, 目的是为了让所有的子节点状态切换以启动动画
  folded = false,
  // 收缩目标节点id
  target = null, 
}) {
  return makeAutoObservable({
    folded: folded,
    target: target,
    parentNode: parentNode,
    children: children,
    stateData: stateData,
    craftSerializeHandler: craftSerializeHandler,
    label: label,
  })
}

function createStore() {
  return makeAutoObservable({
    // global node 1, default 1 for new tree
    id: 1,
    getId() {
      this.id = this.id + 1
      return `${this.id}`
    },
    // avoid text cursor height jumping
    emptyTextInput: false,
    siblingNode: false, 
    sidebarOpen: false,
    cloneMode: false,
    layerSpacing: 15,
    treeDirection: 'DOWN',
    edgePath: 'default',
    editMode: true,
    treeNodes: {},
    zoomLevel: 0,
    inWheel: false,
    alertDlgOpen: false,
    setAlertDlg(bool) {
      this.alertDlgOpen = bool
    },
    // for copy node
    lastSelectedNodeId: "0",
    selectedNodeId: "0",
    switchSiblingNode() {
      this.siblingNode = !this.siblingNode
    },
    setLayerSpacing(value) {
      this.layerSpacing = value
    },
    setEmptyTextInput(bool) {
      this.emptyTextInput = bool
    },
    setTreeDir(dir) {
      this.treeDirection = dir
    },
    setSidebarOpen(bool) {
      this.sidebarOpen = bool
    },
    // nodeId 点击后以该节点为中心启动动画的节点id
    // bool 参数仅为切换回编辑模式从根节点展开所有节点而设置
    setCollapseNodes(nodeId, bool) {
      let collapses = getCollapsePaths(nodeId)
      // leaf node click do nothing
      if (collapses===null) return

      let folded = this.treeNodes[nodeId].folded
      //this.treeNodes[nodeId].folded = !folded
      collapses.nodes.map(item=> {
        this.treeNodes[item].folded = bool===undefined? !folded : bool
        this.treeNodes[item].target = nodeId
      })
    },
    setEdgePath(path) {
      this.edgePath = path 
    },
    switchEditMode(bool) {
      this.editMode = bool
    },
    setCloneMode(bool) {
      this.cloneMode = bool
    },
    setSelectedNode(id) {
      this.lastSelectedNodeId = this.selectedNodeId
      this.selectedNodeId = id
    },
    addTreeNode(id, data) {
      set(this.treeNodes, id, createTreeNode(data))
    },
    setCraftSerialHandler(id, hdl) {
      let node = get(this.treeNodes, id)
      node.craftSerializeHandler = hdl
    },
    updateTreeNodeTree(id, data) {
      let node = get(this.treeNodes, id)
      node.parentNode = data.parentNode
      node.containerChildren = data.containerChildren
    },
    updateTreeNodeNode(id, data) {
      let node = get(this.treeNodes, id)
      node.stateData = data
    },
    setZoomLevel(lvl) {
      this.zoomLevel = lvl
    },
    get selectedNode() {
      return get(this.treeNodes, this.selectedNodeId)
    },
    deleteNode(id) {
      remove(this.treeNodes, id)
      // console.log(toJS(this.treeNodes))
    },
    reset(){
      this.emptyTextInput = false
      this.siblingNode = false
      this.sidebarOpen = false
      this.cloneMode = false
      this.treeDirection = 'DOWN'
      this.edgePath = 'default'
      this.editMode = true
      this.zoomLevel = 0
      // for copy node
      this.lastSelectedNodeId = "0"
      this.selectedNodeId = "0"
    },
    init() {
      keys(this.treeNodes).map(key=> {
        remove(this.treeNodes, key)
      })
      this.id = 1
    },
    loadTree(treeData) {
      this.reset()
      this.treeDirection = treeData.treeDirection
      keys(this.treeNodes).map(key=> {
        remove(this.treeNodes, key)
      })
      Object.entries(treeData.treeNodes).map(([key, value])=> {
        // this.addTreeNode(key, createTreeNode(value))
        this.addTreeNode(key, value)
      })
      // update the last id
      this.id = Math.max(...keys(this.treeNodes))
    },
  })
}


const appStore = createStore()

export const newTreeStateData = `{"ROOT":{"type":{"resolvedName":"NodeFrame"},"isCanvas":true,"props":{"background":"#eee","padding":5,"data-cy":"nodeFrame"},"displayName":"NodeFrame","custom":{"displayName":"NodeFrame"},"hidden":false,"nodes":["eMPZDfJ-tY"],"linkedNodes":{}},"eMPZDfJ-tY":{"type":{"resolvedName":"Container"},"isCanvas":true,"props":{"background":"#eee","padding":5,"alignItems":"center"},"displayName":"Container","custom":{"direction":"row","displayName":"row container"},"parent":"ROOT","hidden":false,"nodes":["r2ZSOiEFAP"],"linkedNodes":{}},"r2ZSOiEFAP":{"type":{"resolvedName":"Text"},"isCanvas":false,"props":{"text":[{"type":"paragraph","children":[{"text":"Node"}]}],"fontColor":"black","textAreaHeight":21,"richTextMode":false,"presentationMode":false,"fontSize":14,"flexDirection":"column","alignItems":"flex-start","justifyContent":"flex-start","fillSpace":"no","padding":["0","0","0","0"],"margin":["5","5","5","5"],"color":{"r":0,"g":0,"b":0,"a":1},"shadow":0,"radius":0,"width":"auto","height":"auto"},"displayName":"Text","custom":{},"parent":"eMPZDfJ-tY","hidden":false,"nodes":[],"linkedNodes":{}}}`

export default appStore

