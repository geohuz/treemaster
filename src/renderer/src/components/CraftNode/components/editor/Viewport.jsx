import { useEditor } from '@craftjs/core';
import {useEffect, memo} from 'react'
import appStore from '../../../../stores/store'
import {isEmpty} from 'lodash'
import { toJS } from 'mobx'

export const Viewport = ({ children, treeNode }) => {
  const { actions, connectors } = useEditor()

  useEffect(()=> {
    // load craftnode data, ignore container data on remount
    let node = appStore.treeNodes[treeNode.id]
    if (node?.children.length===0) {
      if (!isEmpty(node?.stateData)) {
        actions.deserialize(node.stateData)
      }
    }
  }, [])
    // appStore.treeNodes[treeNode.id]?.stateData])

  return (
    <div className="viewport">
      <div className="nodeContainer">
        <div
          className='craftjsRenderer'
          // style={{ paddingTop: '20px' }}
          ref={dom => { 
            connectors.select(connectors.hover(dom, null), null)
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
