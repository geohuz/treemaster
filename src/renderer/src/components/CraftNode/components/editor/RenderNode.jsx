import { useNode, useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import React, { useEffect, useRef, useCallback, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled'
import { debounce } from 'debounce';
// import ArrowUp from '../../assets/icons/arrow-up.svg';
import Delete from '../../assets/icons/delete.svg';
import Move from '../../assets/icons/move.svg';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';

function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
  return btoa(binString);
}

const fileOpts = {
  types: [
    {
      description: "Text file",
      accept: {"image/*": []},
    }
  ]
}

// 大小
const IndicatorDiv = styled.div`
  height: 30px;
  margin-top: -29px;
  font-size: 12px;
  line-height: 12px;

  svg {
    fill: #fff;
    width: 15px;
    height: 15px;
  }
`;

const Btn = styled.a`
  padding: 0 0px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  > div {
    position: relative;
    top: -50%;
    left: -50%;
  }
`;


const RenderNode = ({render}) => {
  const { id, richTextMode, actions: { setProp } } = useNode(node=> {
    return { richTextMode: node.data.props.richTextMode }
  })

  const { actions, query, state, isActive } = useEditor((state, query) => {
    let isActive 
    let selectedId = query.getEvent('selected').last()
    if (selectedId===id) {
      isActive = true
    }
    if (selectedId===undefined) {
      isActive = false
    }
    // isActive: 
    // true: on the node selected, 
    // undefined: not on selected node 
    // false: there is nothing get selected
    return { isActive: isActive }
  })

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    parent,
    connectors: { drag },
  } = useNode((node) => ({
    imgData: node.data.imgData,
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.direction? `${node.data.displayName}: ${node.data.custom.direction} ` : node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));

  const currentRef = useRef();

  useEffect(() => {
    // adding dot line
    if (dom) {
      if (isActive!==undefined && isHover) dom.classList.add('component-selected')
      else dom.classList.remove('component-selected');
      // if (isHover) dom.classList.add('component-selected');
      // if (isActive) dom.classList.remove('component-selected');
    }
  }, [dom, isActive, isHover]);

  // access file system directly
  const openImageFile = async () => {
    // const reader = new FileReader()
    // reader.onload = (event) => {
    //   console.log("event", event)
    //   //const dataURL = event.target.result
    //   const dataURL = reader.result
    //   setProp(prop => prop.imgData = dataURL)
    // }

    const [fileHandle] = await window.showOpenFilePicker(fileOpts)
    const file = await fileHandle.getFile()

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataURL = reader.result
      setProp(prop => prop.imgData = dataURL)
    }
    reader.readAsDataURL(file)

    // api.openImgFile().then(data=>  {
    //   let base64data = bytesToBase64(data)
    //   setProp(prop => prop.imgData = `data:image/jpeg;base64,${base64data}`)
    //   // let localFile = `image://${file}`
    //   // setProp(prop=>prop.imgData = localFile)
    //   // console.log("file", localFile)
    // })
  }

  // 获得el位置：注意这是个绝对位置的数值
  // 因为该数值将应用于 portal, 所以
  // portal应该是基于#root创建
  // 当然如果从root到nodeContainer没有padding/margin
  // 则可以用nodeCotnainer
  // 真实的原因是它的父元素有transform, 所以位置有偏移
  // 如果是document#root则不会
  const getPos = useCallback((dom) => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 };
    let pos = {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    };
    return pos
  }, []);

  const scroll = useCallback(() => {
    const { current: currentDOM } = currentRef;

    if (!currentDOM) return;
    const { top, left } = getPos(dom);
    currentDOM.style.top = top;
    currentDOM.style.left = left;
  }, [dom, getPos]);

  useEffect(() => {
    document
      .querySelector('.craftjsRenderer')
      .addEventListener('scroll', debounce(scroll, 10))

    return () => {
      // console.log("unmount in craft")
      document
        .querySelector('.craftjsRenderer')
        ?.removeEventListener?.('scroll', scroll);
    };
  }, [scroll]);
  
  return (
    <>
      { (!richTextMode && isActive || (!isActive && isHover))
        ? ReactDOM.createPortal(
            <IndicatorDiv
              ref={currentRef}
              className="px-2 py-2 text-white bg-primary fixed flex items-center"
              style={{
                opacity: 0.8,
                left: getPos(dom).left,   // 位置
                top: getPos(dom).top,
                zIndex: 9999,
              }}
            >
              { isActive && name==="Text"? (
                <Btn
                  className="mr-1 cursor-pointer"
                >
                  <EditIcon onClick={()=>{
                    setProp(props=> {
                      props.richTextMode = true}
                    )
                  }}/>
                </Btn>
                ): null
              }
              {/* {id !== ROOT_NODE && ( */}
              {/*   <Btn */}
              {/*     className="mr-2 cursor-pointer" */}
              {/*     onClick={() => { */}
              {/*       actions.selectNode(parent); */}
              {/*     }} */}
              {/*   > */}
              {/*     <ArrowUp /> */}
              {/*   </Btn> */}
              {/* )} */}
              {moveable ? (
                <Btn className="mr-1 cursor-move" ref={drag}>
                  <Move />
                </Btn>
              ) : null}
              {deletable ? (
                <Btn
                  className="mr-1 cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    actions.delete(id);
                  }}
                >
                  <Delete />
                </Btn>
              ) : null}
              {name==="Image" ? (
                <Btn
                  className="ml-2 cursor-pointer"
                  onClick={openImageFile}
                >
                  <AddPhotoAlternateIcon />
                </Btn>
               ) : null}
              <h2 className="flex-1">{name}</h2>
            </IndicatorDiv>,
            document.querySelector("#root")
            //ref.current.querySelector('.nodeContainer')
            //ref.current.parentElement  // 关键在这里要引用正确的节点
            // document.querySelector('.nodeContainer')
          )
        : null}
      {render}
    </>
  );
};

export default RenderNode

 

