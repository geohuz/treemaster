import React, { useCallback, useState, useMemo, useRef, forceRerender, useEffect, memo } from 'react';
import {applyLayout} from './applyLayout'
import {dirMatrix, fileOpts} from './global'
import ReactFlow, {
  SelectionMode,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel,
  MiniMap,
  Controls,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  useOnSelectionChange,
  getRectOfNodes,
  getTransformForBounds,
  useViewport
} from 'reactflow';
import CNode from './CNode'
import CEdge from './CEdge'
import SubgraphContainer from './SubgraphContainer.jsx'
import 'reactflow/dist/base.css';
//import { styled }  from 'twin.macro'
import { styled } from '@mui/material/styles';
import {nodeHSpacing, nodeVSpacing } from './global'
import {replaceChar} from './utils'
import SelectEdge from './SelectEdge.jsx'
import appStore, {newTreeStateData} from '../../stores/store'
import { populateGraph, getCollapsePaths } from '../../stores/store';
import {observer, useLocalObservable} from 'mobx-react-lite'

import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography  from '@mui/material/Typography';
import Slider from '@mui/material/Slider'
import Popover from '@mui/material/Popover';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LayersClearOutlinedIcon from '@mui/icons-material/LayersClearOutlined';
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import Button from '@mui/material/Button';
import { Fill } from 'nano-slots'
import { toPng } from 'html-to-image'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

import {ReactFlowProvider} from 'reactflow'
import {toJS} from 'mobx'
import {useTheme} from '@mui/material/styles'
import { themeColors } from '../../global'
// import {pdb} from '../../main'

const [colors, hexColor] = themeColors()

function downloadImage(dataUrl) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const OnOff = {true: 'On', false: 'Off'}
const ReactFlowStyled = styled(ReactFlow)`
  .react-flow__handle-left, .react-flow__handle-right {
    background-color: #2d0a5824;
    visibility: ${({treedirection})=>treedirection==='RIGHT'? 'visible' : 'hidden'};
  }

  .react-flow__handle-top, .react-flow__handle-bottom {
    background-color: #2d0a5824;
    visibility: ${({treedirection})=>treedirection==='DOWN'? 'visible' : 'hidden'};
  }
`;

const nodeTypes = { 
  CNode, 
  SubgraphContainer 
}

const edgeTypes = {
  CEdge
}

const initialNodes = [
  {
    id: '0',
    type: 'CNode',
    width: 80,
    height: 51,
    data: { label: 'Node' },
    position: { x: 0, y: 0 },
    // 根节点不可以删除
    deletable: false,
  },
];


// 完全从scratch初始化
initialNodes.map(item=> {
  appStore.addTreeNode(
    item.id, 
    {label: item.data.label}
  )
})

const TreeMan = observer(() => {
  const openFile = async () => {
    // const file = event.target.files[0];
    // const reader = new FileReader();

    // reader.onload = (e) => {
    //   const content = e.target.result;
    //   fileMan.setFileContent(content);
    // };

    // reader.readAsText(file);

    const [fileHandle] = await window.showOpenFilePicker(fileOpts)
    const file = await fileHandle.getFile()
    const contents = await file.text()
    deserialTreeData(contents)
  };

  const saveFile = async () => {
    try {
      const handle = await window.showSaveFilePicker(fileOpts)
      const writable = await handle.createWritable()
      await writable.write(serialTreeData())
      await writable.close()
    } catch (error) {
      console.log("Error saving file", error)
    }
  }

  const { zoom } = useViewport()
  const { setViewport, fitView, getNodes, setCenter } = useReactFlow();

  const states = useLocalObservable(()=> ({
    rfInstance: null,
    refreshTree: false,
    refreshEdge: false,
    setRfInstance(inst) {
      this.rfInstance = inst
    },
    switchRefreshTree() {
      this.refreshTree = !this.refreshTree
    },
    switchRefreshEdge() {
      this.refreshEdge = !this.refreshEdge
    }
  }))

  // const [rfInstance, setRfInstance] = useState(null);
  // const [refreshTree, setRefreshTree] = useState(false)
  // const [refreshEdge, setRefreshEdge] = useState(false)

  const reactFlowInstance = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // useEffect(()=> {
  //   setViewport({ x: 0, y: 0, zoom: 1 });
  // }, [])

  const onDownloadClick = useCallback((bkgColor, imageWidth, imageHeight) => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      // todo: selectable background color
      backgroundColor: bkgColor,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  }, [])

  const serialTreeData = () => {
    if (states.rfInstance) {
      // reactflow data
      let flow = states.rfInstance.toObject();
      // mobx data
      let mbx = toJS(appStore)
      let data = {flow: flow, mbx: mbx}
      // console.log("data", data)
      return JSON.stringify(data)
      //localStorage.setItem(flowKey, JSON.stringify(data));
    }
  }

  const deserialTreeData  = (contents) => {
    const restoreFlow = async () => {
      const data = JSON.parse(contents)
      let mbx = data.mbx
      let flow = data.flow;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
      // todo: will throw
      appStore.loadTree(mbx)
    };

    restoreFlow();
  }

  const newTree = useCallback(()=> {
    setNodes([])
    setEdges([])

    reactFlowInstance.addNodes(initialNodes)

    appStore.reset()
    appStore.init()

    // initialNodes.map(item=> {
    //   appStore.addTreeNode(
    //     item.id, 
    //     {label: item.data.label}
    //   )
    // })

    appStore.addTreeNode(
      initialNodes[0].id,
      { label: initialNodes[0].data.label,
        stateData: newTreeStateData
      },
    )

    //appStore.updateTreeNodeNode(0, newTreeStateData)
    appStore.setAlertDlg(false)
  }, [])

  // 选择节点
  useOnSelectionChange({
    onChange: ({nodes, _ }) => 
    {
      if (nodes[0]) {
        appStore.setSelectedNode(nodes[0].id)
      }
    }
  })
  
  // click事件包裹useCallback提高性能
  const onNodeClick = useCallback(() => {
    appStore.editMode && appStore.setSidebarOpen(true)
  }, [])

  const treeRefresh = () => {
    states.switchRefreshTree()
  }

  const edgeRefresh = () => {
    states.switchRefreshEdge()
  }

  useEffect(()=> {
    onLayout(appStore.treeDirection)
  }, [states.refreshTree])

  useEffect(()=> {
    changeEdgeType()
  }, [appStore.edgeType])


  const changeEdgeType = () => {
    setEdges(oldEdges => {
      let edgesCopy = [...oldEdges]
      edgesCopy.map(edge => {
        if (edge.sourceHandle) {
          edge.type = appStore.edgeType
        }
      })
      return edgesCopy
    })
  }

  useEffect(() => {
    appStore.setZoomLevel(zoom)
  }, [zoom])

  // 注意变量取名，用deleted来避免和state变量nodes区别
  const onDelete = useCallback(deleted=> {
      let delNode = deleted[0]
      // 先处理mobx store
      appStore.deleteNode(delNode.id)
      if (delNode.parentNode) {
        setNodes(nds=>{
          let data = [...nds]
          data.forEach(nnode=> {
            // change container width, and remove delete id from container children
            if (nnode.id===delNode.parentNode) {
              switch (appStore.treeDirection) {
                case "DOWN":
                  let width = nnode.width - delNode.width - nodeHSpacing 
                  nnode.width = width
                  nnode.style = {...nnode.style, width: width }
                  break
                case "RIGHT":
                  let height = nnode.height - delNode.height - nodeVSpacing 
                  nnode.height = height
                  nnode.style = {...nnode.style, height: height}
                  break
              }
              let delNodeIdx = nnode._children.findIndex(item=>item === delNode.id)
              nnode._children.splice(delNodeIdx, 1)
            }
            switch (appStore.treeDirection) {
              case "DOWN":
                // shift all nodes in container to left
                if (nnode.parentNode === delNode.parentNode && nnode.position.x > delNode.position.x) {
                   nnode.position.x = nnode.position.x - delNode.width - nodeHSpacing
                }
              break
              case"RIGHT":
                if (nnode.parentNode === delNode.parentNode && nnode.position.y > delNode.position.y) {
                   nnode.position.y = nnode.position.y - delNode.height - nodeVSpacing
                }
            }
          })
          return data
        }) 
      }
      // 删除节点后edge的修复
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => {
              // sibling 节点
              let sp = nodes.filter(item=>item.id === source && item.parentNode).length
              let tp = nodes.filter(item=>item.id === target && item.parentNode).length
              let handle = {}
              if (sp>0 || tp>0) {
                let dirHdl = {...dirMatrix.handles, 
                  sibling: dirMatrix.handles[dirMatrix[appStore.treeDirection].sibling]}
                let reverseHandle = dirHdl[dirMatrix[appStore.treeDirection].reverse]
                reverseHandle.sh = replaceChar(reverseHandle.sh, 0, 't')
                reverseHandle.th = replaceChar(reverseHandle.th, 0, 's')
                handle = {sourceHandle: dirHdl['sibling'].sh, targetHandle: dirHdl['sibling'].th} 
              } else {
                // 正常节点的edge恢复
                let norm = dirMatrix[appStore.treeDirection].handleNorm[1]
                let normHdls = dirMatrix.handles[norm]
                handle = {sourceHandle: normHdls.sh, targetHandle: normHdls.th}
              }
              return { id: `${source}->${target}`, source, target, ...handle, type: "CEdge"}
            }
          ));

          return [...remainingEdges, ...createdEdges];
        }, edges)
      )
    }, [nodes, edges])

  // 不允许重复连接, 自连接
  const isValidConnection = (connection) => {
    let existedConnection =  
      edges.filter(
        item=> 
          [item.source, item.target].sort().join(',')
          === 
          [connection.source, connection.target].sort().join(',')
      ).length>0
      
    let selfConnection = (connection.source == connection.target)

    return !existedConnection && !selfConnection
  }
  
  // 如果是反向连接拉出的连接线要交换source target
  const onConnect = useCallback((params) => {
    let m_params
    let reverseId = dirMatrix[appStore.treeDirection].reverse.charAt(0).toLowerCase()
    reverseId = `s${reverseId}`
    if (params.sourceHandle===reverseId) {
      m_params = {
        source: params.target, 
        sourceHandle: `s${params.targetHandle.charAt(1)}`, 
        target: params.source,
        targetHandle: `t${params.sourceHandle.charAt(1)}`
      }
    }
    m_params= {...params, ...{type: 'CEdge'} }
    setEdges(eds => addEdge(m_params, eds))
  }, [edges])

  const onLayout = useCallback(
    async(direction) => { 
      // the best solution to avoid create edge error is to clear the nodes first
      setNodes([])
      setEdges([])
      // extra fitView to force refresh
      window.requestAnimationFrame(() => fitView({padding: 0, maxZoom: 1}));
      const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      fitView({padding: 0, maxZoom: 1})
    },
    [nodes, edges]
  );

  const onMove = (_, viewport) => {
    appStore.setZoomLevel(viewport.zoom)
  }

  return (
    <>
      <div className="wrapper">
        <ReactFlowStyled
          selectionMode={SelectionMode.Partial}
          treedirection={appStore.treeDirection}
          isValidConnection={isValidConnection}
          nodes={nodes}
          edges={edges}
          onMove={onMove}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onDelete}
          multiSelectionKeyCode={null}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          // disable unexpected zoomin when node add icon clicked
          zoomOnDoubleClick={false}
          onlyRenderVisibleElements
          fitView
          onInit={states.setRfInstance}
          fitViewOptions={{padding: 0, maxZoom: 1}}
        >  
          <MiniMap zoomable pannable />
          {/* <Panel position="bottom-right">
            <Button onClick={() => console.log(toJS(appStore.treeNodes))}>
              echo mobx
            </Button>
            <Button onClick={() => console.log(nodes, edges)}>
              echo flow
            </Button>
            <Button onClick={() => {
              let xxx = populateGraph(nodes, edges)
              console.log(xxx.nodes())
              console.log(getCollapsePaths(0))
            }}
            >
              echo graph
            </Button> 
          </Panel>  */}
        </ReactFlowStyled>
      </div>
      <PanelControls 
      saveFile={saveFile}
      openFile ={openFile}
      onDownloadClick={onDownloadClick} 
      treeRefresh={treeRefresh} 
      edgeRefresh={edgeRefresh} 
      nodes={nodes} 
      edges={edges} />

      <NewTreeDialog newTree={newTree} />
    </>
  );
});

const sliderMarks = [
  {
    value: 15, 
    label: '15',
  },
  {
    value: 30,
    label: '30',
  },
  { value: 50,
    label: '50'
  },
  { value: 80,
    label: '80'
  }
]
const PanelControls = memo(observer(({saveFile, openFile, onDownloadClick, treeRefresh, edgeRefresh, nodes, edges}) => {

  const theme = useTheme()

  const states = useLocalObservable(()=> ({
    treeDir: 'DOWN',
    exportBkgColor: '',
    exportWidth: 1024,
    exportHeight: 768,
    anchorEl: null,
    anchorElDm: null,
    setTreeDir(dir) {
      this.treeDir = dir
    },
    setExportWidth(value) {
      this.exportWidth = value
    },
    setExportHeight(value) {
      this.exportHeight = value
    },
    setExportBkgColor(value) {
      this.exportBkgColor = value
    },
    setAnchorEl(value) {
      this.anchorEl = value
    },
    setAnchorElDm(value) {
      this.anchorElDm = value
    }
  }))
  
  // const [treeDir, setTreeDir] = useState("DOWN")
  // console.log("PanelControls is being rendered")

  const switchEditOff = () => {
    appStore.switchEditMode(false)
    // 节点和edge不可删除在展示模式
    nodes.map(item=> {
      item.deletable = false
    })
    edges.map(item=> {
      item.deletable = false
    })
    populateGraph(nodes, edges)
    appStore.setSidebarOpen(false)
  }

  const switchEditOn = () => {
    // 切换回编辑模式要展开全部节点
    appStore.setCollapseNodes(0, false)
    appStore.switchEditMode(true)
    // 恢复可删除性
    nodes.map(item=> {
      if (item.id!=='0') item.deletable = true
    })
    edges.map(item=> {
      item.deletable = true
    })
  }

  return (
    <Fill name="treeControls">
      <Box sx={{ml: 10}}>
        <Tooltip title="New Tree">
          <IconButton onClick={()=>appStore.setAlertDlg(true)} color="inherit">
            <InsertDriveFileOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`clone node ${OnOff[appStore.cloneMode]}`}>
          {appStore.cloneMode? 
            <IconButton size="medium" color="inherit" onClick={()=>appStore.setCloneMode(false)}>
              <LayersOutlinedIcon />
            </IconButton>
          : 
          <IconButton size="medium" color="inherit" onClick={()=>appStore.setCloneMode(true)}>
            <LayersClearOutlinedIcon />
            </IconButton>
          }
        </Tooltip>
        <Tooltip title={`Edit ${OnOff[appStore.editMode]}`}>
          {appStore.editMode? 
            <IconButton size="small" color="inherit" onClick={switchEditOff} >
              <EditOutlinedIcon />
            </IconButton>
            :
            <IconButton size="small" color="inherit" onClick={switchEditOn} >
              <EditOffOutlinedIcon />
            </IconButton>
          }
        </Tooltip>
      </Box>
      <IconButton color="inherit">
        <ParkOutlinedIcon 
          onClick={e=>states.setAnchorEl(e.currentTarget)} 
        />
        <Popover
          id={Boolean(states.anchorEl)? "pop1" : undefined}
          open={Boolean(states.anchorEl)}
          anchorEl={states.anchorEl}
          onClose={()=>states.setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ mt: 1, pt: 1, pb: 1, pl: 3, pr: 3, width: 180 }}>
            <Typography gutterBottom variant="body2">
              Tree layer distance
            </Typography>
            <Slider size={"small"} marks={sliderMarks} value={appStore.layerSpacing} min={15} max={80} 
              onChange={(_, newValue)=>appStore.setLayerSpacing(newValue)} 
            />
          </Box>
        </Popover>
      </IconButton>
      <ToggleButtonGroup
        sx={{ml: 1}}
        value={states.treeDir}
        size="small"
        onChange={(_, value)=> {
          value = value===null? states.treeDir : value
          states.setTreeDir(value)
          appStore.setTreeDir(value)
          treeRefresh()
        }}
        exclusive
      >
        <ToggleButton value="DOWN">
          {/* <AccountTreeOutlinedIcon className="rotate90" /> */}
          <LanOutlinedIcon />
        </ToggleButton>
        <ToggleButton value="RIGHT">
          <AccountTreeOutlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup>
        {/* <SsidChartIcon /> */}
      <SelectEdge edgeRefresh={edgeRefresh} />
      {/* <Tooltip title={`sibling node ${OnOff[appStore.siblingNode]}`}>
        {appStore.siblingNode?
          <IconButton size="small" onClick={()=>appStore.switchSiblingNode()}>
            <GroupWorkOutlinedIcon />
          </IconButton>
          :
        <IconButton size="small" onClick={()=>appStore.switchSiblingNode()}>
          <WorkspacesOutlinedIcon />
        </IconButton>
        }
      </Tooltip> */}
      <Tooltip title="Save file">
        <IconButton color="inherit" onClick={saveFile}>
          <SaveOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open file">
        <IconButton color="inherit" onClick={openFile}>
          {/* component="label" */}
          {/* <input
            accept=".json"
            type="file"
            style={{display: "none"}}
            onChange={openFile}
          /> */}
          <FolderOpenOutlinedIcon />
        </IconButton>
      </Tooltip>
        <IconButton color="inherit" >
          <DownloadOutlinedIcon onClick={e=>{
            states.setExportBkgColor('')
            states.setAnchorElDm(e.currentTarget)}} />
          <Popover
            id={Boolean(states.anchorElDm)? "pop2" : undefined} 
            open={Boolean(states.anchorElDm)}
            anchorEl={states.anchorElDm}
            onClose={()=>states.setAnchorElDm(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
          >
            <Box sx={{pt: 0, pb: 1, pl: 2, pr: 2, width: 200}}>
              <FormControl variant="standard" fullWidth component="fieldset" margin="normal">
                <InputLabel>Background color</InputLabel>
                <Select
                  defaultValue=''
                  onChange={(e)=>states.setExportBkgColor(e.target.value)}
                >
                  {colors.map(value=> {
                    return (
                      <MenuItem key={value} value={hexColor(theme, value)}>
                        <Box sx={{width: "100%", bgcolor: value}}>
                          &nbsp;
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <FormControl>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField size="small" label="width" value={states.exportWidth} 
                      onChange={e=>states.setExportWidth(e.target.value)} variant="standard" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField size="small" label="height" value={states.exportHeight}
                      onChange={e=>states.setExportHeight(e.target.value)} variant="standard" />
                  </Grid>
                </Grid>
              </FormControl>
              <FormControl fullWidth component="fieldset" margin="normal">
                <Button variant="outlined" onClick={()=> {
                  onDownloadClick(states.exportBkgColor, states.exportWidth, states.exportHeight)
                  states.setAnchorElDm(null)
                }}>
                  Download image
                </Button>
              </FormControl>
            </Box>
          </Popover>
        </IconButton>
    </Fill>
  )
}))

const NewTreeDialog = observer((props) => {
  return (
    <Dialog
      open={appStore.alertDlgOpen}
      onClose={()=>appStore.setAlertDlg(false)}
    >
      <DialogTitle>
        Unsaved changes will lost, proceed?
      </DialogTitle>
      <DialogActions>
        <Button onClick={props.newTree}>Ok</Button>
        <Button onClick={()=>appStore.setAlertDlg(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
})

export default ()=>
  <ReactFlowProvider>
    <TreeMan />
  </ReactFlowProvider>

