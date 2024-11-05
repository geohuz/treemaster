import { useRef, useEffect, memo } from 'react'
import { Editor, Frame, Element } from '@craftjs/core';
// import {Layers} from '@craftjs/layers'
import { Paper } from '@mui/material';
import { SettingsPanel } from './components/SettingsPanel';
import { Toolbox } from './components/Toolbox';
import { Topbar } from './components/Topbar';
import { NodeFrame } from './components/user/NodeFrame';
import { Container } from './components/user/Container'
import { ImageBox } from './components/user/ImageBox'
import { RatingBox } from './components/user/RatingBox'
import { Text } from './components/user/Text';
import { css } from '@emotion/react';
import RenderNode  from './components/editor/RenderNode'
import { Viewport } from './components/editor/ViewPort' 
import {genSlateContent} from './utils'

import Portal from '@mui/base/Portal'
import {portalRef} from '../Applayout'
import {portalRightRef} from '../Applayout'

import classNames from 'classnames'
import {rf_global} from '../../routes/treeman/global'
import './craftnode.css'

import {observer} from 'mobx-react-lite'
import {toJS} from 'mobx'
import appStore from '../../stores/store'

const CraftNode = observer(({treeNode}) => {
    // disable treenode dragging/scrolling
    // for craft node editing
    const enableTreeNodeDrag = classNames({
       'nodrag':  treeNode.selected,
       'nowheel': treeNode.selected
    })

    return (  
      <div className={enableTreeNodeDrag}>
        <Editor
          resolver={{
            Container,
            Text,
            NodeFrame,
            ImageBox,
            RatingBox
          }}
          indicator={{
            'success': '#AADB1E',   // bright green
            //'success': '#2d9d78', // green
            'error': '#E10600',      // bright red   
            //'error': '#e34850', // red
            'thickness': 5
          }}
          onRender = {el=> 
            <RenderNode 
              render={el.render} 
            />
          }
          enabled={appStore.editMode ? treeNode.selected : false}
          // save node data
          onNodesChange={query => {
            // ignore container node
            if (appStore.treeNodes[treeNode.id].children.length===0) {
              appStore.updateTreeNodeNode(treeNode.id, query.serialize())
            }
          }}
        >
          {/* <Topbar />  */}
          <Viewport treeNode={treeNode}>
            <Frame>
              <Element
                canvas
                is={NodeFrame}
                padding={rf_global.padding}
                //background="#eee"
                data-cy="nodeFrame"
              >
                <Element
                  canvas
                  is={Container}
                  custom={{displayName: "row container"}}
                  // padding={['0', '20', '0', '20']}
                >
                  <Text text={genSlateContent(treeNode.data.label)} /> 
                </Element>
              </Element>
            </Frame>
            <Portal container={portalRef.current}>
              {(appStore.editMode? treeNode.selected : false) && <Toolbox /> }
            </Portal>
            <Portal container={portalRightRef.current}>
              {(appStore.editMode? treeNode.selected : false) && <SettingsPanel /> }
            </Portal>
          </Viewport>
        </Editor>
      </div>
    )
})


export default memo(CraftNode)
// <SettingsPanel />
