import React, {useRef, useState, useEffect, useMemo, forwardRef}  from 'react';
import { BaseEdge, getBezierPath, getSimpleBezierPath, getSmoothStepPath, 
getStraightPath } from 'reactflow';

import {observer} from 'mobx-react-lite'
import appStore from '../../stores/store'
import {reaction} from 'mobx'
import { useSpring, useSpringRef, animated } from '@react-spring/web'
import {partial} from 'lodash'

const edgesGenerators = {
  "smoothstep": getSmoothStepPath, 
  "step": (params)=> getSmoothStepPath({...params, ...{borderRadius: 0}}),
  "default": getBezierPath, 
  "straight": getStraightPath
}

const AnimatedEdge = animated(BaseEdge)

const CEdge = observer(({
  id,
  source, 
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
}) => {

  const [edgePath] = edgesGenerators[appStore.edgePath]({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [skipRender, setSkipRender] = useState(false)

  const api = useSpringRef()

  const getDashOffset = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); 
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); 

    path.setAttribute("d", edgePath);
    svg.appendChild(path);
    return path.getTotalLength();
  }

  const springs = useSpring({
    ref: api,
    from : {
      strokeDashoffset: 0,
      strokeDasharray: getDashOffset()
    },
  })

  // mount的时候如果节点是折叠状态则不要渲染Edges
  useEffect(()=> {
    setSkipRender(appStore.treeNodes[source].folded)
  }, [appStore.treeNodes[source]?.folded===true])
  
  let disposer = reaction (
    ()=> (appStore.treeNodes[source]?.folded),
    (folded) => {
      let offset
      if (folded) {
        offset = getDashOffset()
      } else {
        offset = 0
      }
      api.start({
        config: {
          friction: 20,
          tension: 210
        },
        to: {
          strokeDashoffset: offset 
        }
      })
    }
  )

  // 防止内存泄露
  useEffect(() => {
    return () => disposer()
  })

  return (
    appStore.editMode?  <BaseEdge path={edgePath} style={style} />
      :
    !skipRender && <AnimatedEdge path={edgePath} style={{...style, ...springs}} />
    
  )
})


export default CEdge