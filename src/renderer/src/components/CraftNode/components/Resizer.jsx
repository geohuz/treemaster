import { useNode, useEditor } from '@craftjs/core';
import { debounce } from 'debounce';
import { Resizable } from 're-resizable';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styled } from "@mui/system";
import { css } from '@emotion/react';
import  appStore from '../../../stores/store'
import {observer} from 'mobx-react-lite'

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from './numToMeasurement';

const Indicators = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  span {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 100%;
    display: block;
    box-shadow: 0px 0px 12px -1px rgba(0, 0, 0, 0.25);
    z-index: 99999;
    pointer-events: none;
    border: 2px solid #36a9e0;
    &:nth-of-type(1) {
      ${(props) =>
        props.bound
          ? props.bound === 'row'
            ? `
                left: 50%;
                top: -5px;
                transform:translateX(-50%);
              `
            : `
              top: 50%;
              left: -5px;
              transform:translateY(-50%);
            `
          : `
              left: -5px;
              top:-5px;
            `}
    }
    &:nth-of-type(2) {
      right: -5px;
      top: -5px;
      display: ${(props) => (props.bound ? 'none' : 'block')};
    }
    &:nth-of-type(3) {
      ${(props) =>
        props.bound
          ? props.bound === 'row'
            ? `
                left: 50%;
                bottom: -5px;
                transform:translateX(-50%);
              `
            : `
                bottom: 50%;
                left: -5px;
                transform:translateY(-50%);
              `
          : `
              left: -5px;
              bottom:-5px;
            `}
    }
    &:nth-of-type(4) {
      bottom: -5px;
      right: -5px;
      display: ${(props) => (props.bound ? 'none' : 'block')};
    }
  }
`;

export const Resizer = observer(({ propKey, children, ...props }) => {
  const {
    id,
    actions: { setProp },
    connectors: { connect },
    fillSpace,
    nodeWidth,
    nodeHeight,
    parent,
    active,
    inNodeContext,
    richTextMode
  } = useNode((node) => ({
    richTextMode: node.data.props.richTextMode,
    parent: node.data.parent,
    active: node.events.selected,
    nodeWidth: node.data.props[propKey.width],
    nodeHeight: node.data.props[propKey.height],
    fillSpace: node.data.props.fillSpace,
  }));

  const textAreaFontSize = useRef(0)
  const globalLineHeight = 1.5

  const { isTextNode, isRootNode, parentDirection } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last()
    let isTextNode

    if (state.nodes[currentNodeId]?.data.type.name==="Text") {
      let nodeData = state.nodes[currentNodeId].data
      textAreaFontSize.current = nodeData.props.fontSize
      isTextNode = true
    }

    return {
      isTextNode: isTextNode,
      parentDirection:
        parent &&
        state.nodes[parent] &&
        state.nodes[parent].data.props.flexDirection,
        isRootNode: query.node(id).isRoot(),
    };
  });

  const resizable = useRef(null);
  const isResizing = useRef(false);
  const editingDimensions = useRef(null);
  const nodeDimensions = useRef(null);
  nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

  /**
   * Using an internal value to ensure the width/height set in the node is converted to px
   * because for some reason the <re-resizable /> library does not work well with percentages.
   */
  const [internalDimensions, setInternalDimensions] = useState({
    width: nodeWidth,
    height: nodeHeight,
  });

  const updateInternalDimensionsInPx = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;
    
    const width = percentToPx(
      nodeWidth,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).width
    );
    const height = percentToPx(
      nodeHeight,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).height
    );

    setInternalDimensions({
      width: width,
      height: height 
    });
  }, []);

  const updateInternalDimensionsWithOriginal = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;
    
    // resize停止时不会跳动大小
    setInternalDimensions({
      width: nodeWidth / appStore.zoomLevel,
      height: nodeHeight / appStore.zoomLevel
    });
  }, []);

  const getUpdatedDimensions = (width, height) => {
    const dom = resizable.current.resizable;
    if (!dom) return;

    const currentWidth = parseInt(editingDimensions.current.width),
      currentHeight = parseInt(editingDimensions.current.height);

    return {
      width: (currentWidth + parseInt(width)),
      height: (currentHeight + parseInt(height))
    };
  };

  useEffect(() => {
    if (!isResizing.current) updateInternalDimensionsWithOriginal();
  }, [nodeWidth, nodeHeight, updateInternalDimensionsWithOriginal]);

  useEffect(() => {
    const listener = debounce(updateInternalDimensionsWithOriginal, 100);
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [updateInternalDimensionsWithOriginal]);

  return (
    <Resizable
      // make the drag handler easier to access
      enable={[
        'top',
        'left',
        'bottom',
        'right',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
      ].reduce((acc, key) => {
        acc[key] = active && inNodeContext;
        return acc;
      }, {})}
      minHeight={textAreaFontSize.current}
      // 减小handler方块大小，make the drag handler easier to acess in default zoomlevel = 2
      // handleStyles={{
      //   bottomLeft: {width: 10, height: 10},
      //   bottomRight: {width: 10, height: 10},
      //   topLeft: {width: 10, height: 10},
      //   topRight: {width: 10, height: 10},
      // }}
      css={theme=>css`
        m-auto: ${isRootNode};
        flex: true;
        max-width: 400px;
        ${active && 
        `
          border-style: dashed;
          border-width: 1px;
          border-Color: ${theme.palette.primary.main};
        `}
      `}
      ref={(ref) => {
        if (ref) {
          resizable.current = ref;
          connect(resizable.current.resizable);
        }
      }}
      // 确保鼠标和动态大小位置一致
      scale={appStore.zoomLevel}
      size={internalDimensions}
      onResizeStart={(e) => {
        updateInternalDimensionsInPx();
        e.preventDefault();
        e.stopPropagation();
        const dom = resizable.current.resizable;
        if (!dom) return;
        editingDimensions.current = {
          width: dom.getBoundingClientRect().width,
          height: dom.getBoundingClientRect().height,
        };
        isResizing.current = true;
      }}
      onResize={(_, __, ___, d) => {
        const dom = resizable.current.resizable;
        let { width, height } = getUpdatedDimensions(d.width, d.height);
        if (isPercentage(nodeWidth))
          width =
            pxToPercent(width, getElementDimensions(dom.parentElement).width) +
            '%';
        else width = `${width}px`;

        if (isPercentage(nodeHeight))
          height =
            pxToPercent(
              height,
              getElementDimensions(dom.parentElement).height) + '%';
        else height = `${height}px`;

        if (isPercentage(width) && dom.parentElement.style.width === 'auto') {
          width = editingDimensions.current.width + d.width + 'px';
        }

        if (isPercentage(height) && dom.parentElement.style.height === 'auto') {
          height = editingDimensions.current.height + d.height + 'px';
        }
        setProp((prop) => {
          prop[propKey.width] = width;
          prop[propKey.height] = height;
        }, 500);
        // 更新resizerHeigher, 给Text计算 overflow_y
        setProp(prop=> {prop.resizerHeight = height}, 500)
      }}
      onResizeStop={() => {
        isResizing.current = false;
        updateInternalDimensionsWithOriginal();
      }}
      {...props}
    >
      {children}
      {
        (active  && (richTextMode===false || richTextMode===undefined)) && (
          <Indicators bound={fillSpace === 'yes' ? parentDirection : false}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </Indicators>
        )
      }
    </Resizable>
  );
});

export const ResizerDefaultProps = {
  resizerHeight: null,
}

Resizer.craft = {
  custom: {
    dimension: {
      height: 100, width: 100
    }
  },
}

// snap的纵向值, 以确保文字不被cutoff
// grid = {[1, isTextNode? globalLineHeight * textAreaFontSize.current : 1]}
