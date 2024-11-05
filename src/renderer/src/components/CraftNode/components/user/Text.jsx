import { useNode, useEditor as useEditor } from '@craftjs/core';
import { Slider, FormControl, FormLabel } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { Resizer } from '../Resizer'
import {css} from '@emotion/react'

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';
import RichEditor from '../RichEditor'
import { ResizerDefaultProps } from '../Resizer';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '../../../MuiSwitch';

const OnOffColor = {true: 'black', false: 'white'}
import appStore from '../../../../stores/store'

/* presentation mode: text变成more button, 
点击buttton editor没有toolbar, force dialog open
globalEnabled: 整个editor 进入 readonly 状态, 也就进入presentation mode
*/
const MoreTextButton = styled(Button)`
  padding: 0px;
  line-height: 1.5;
  text-transform: initial;
  vertical-align: top;
  display: block;
  width: 100%;
  height: 100%;
  text-align: left;
`

const textAreaMargin = '5'

const defaultProps = {
  // display: 'block',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: [textAreaMargin, textAreaMargin, textAreaMargin, textAreaMargin],
  //  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: 'auto',
  height: 'auto', 
};

export const Text = ({ text, fontColor, fontSize, textAlign, ...props }) => {
  const [isEditable, setEditable] = useState(false)
  const simpleEditorRef = useRef()

  const {
    id: id,
    selected,
    overflow_y,
    richTextMode,
    presentationMode,
    actions: { setProp },
    connectors: { connect, drag },
    resizerHeight,
    textAreaHeight,
  } = useNode(node=> {
    return {
      richTextMode: node.data.props.richTextMode,
      presentationMode: node.data.props.presentationMode,
      selected: node.events.selected,
      overflow_y: node.data.props.overflow_y,
      resizerHeight: node.data.props.resizerHeight,
      textAreaHeight: node.data.props.textAreaHeight
    }
  })

  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    // background,
    color,
    padding,
    margin,
    shadow,
    radius,
  } = props

  // 必须带上state调用， 否则报错, 因为这是有次序的
  const { globalEnabled, actions, isActive, query: {node}} = useEditor((state, query) => {
    let isActive
    let selectedId = query.getEvent('selected').last()
    if (selectedId===id) {
       isActive = true
    } else isActive = false
    return {
      isActive: isActive,
      globalEnabled: state.options.enabled,
    }
  })

  // 计算并更新overflow_y
  useEffect(()=> {
    if (isActive) {
      // console.log("textHeight", textAreaHeight)
      // console.log("resizer", resizerHeight)
      let overflow_y = textAreaHeight > parseInt(resizerHeight)? true : false
      setProp(props=> props.overflow_y = overflow_y)
    }
  }, [textAreaHeight, resizerHeight])

  function editorContentChangeHandler(value) {
    // 防止光标在空输入时变高
    if (value.length===1) {
      let text = value[0].children[0].text
      if (text==="") {
        appStore.setEmptyTextInput(true)
      } else {
        appStore.setEmptyTextInput(false)
      }
    }
    setProp((props=>props.text = value), 500)
  }

  function applyChange () {
    simpleEditorRef.current.applyContent(text)
    setProp((props=>props.text = text), 500)
    
    if (text[0].children) {
      if (text[0].children[0].text==="") {
        actions.delete(id)
      }
    }
  }

  useEffect(() => {
    if (selected) {
      return 
    } 
    setEditable(false)
  }, [selected])

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        display: "inline-box",
        justifyContent,
        flexDirection,
        alignItems,
        // background: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? 'none'
            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
      }}
    >
      <div
        // ref={(ref) => connect(drag(ref))}   drag就会导致text区域trigger drag, 并导致选择文本很麻烦
        ref={connect}  // 关闭drag就好了
        onClick={()=>selected && setEditable(true)}
        css={css`
          width: 100%;
          height: 100%;
          overflow: hidden;
        `}
      >
        <CondWrapper
          condition={!globalEnabled && overflow_y}
          wrapper={children => 
            <MoreTextButton onClick={ 
                ()=>setProp(props=>props.presentationMode = true) 
              } 
              variant="text" 
            >
              {children}
            </MoreTextButton>
          }
        >
          <RichEditor
            ref={simpleEditorRef}
            simpleMode={true}
            withToolbar={false}
            initialValue={text}
            onChange={editorContentChangeHandler}
            editorStyle={css`
              color: ${fontColor};
              font-size: ${fontSize}px;
              text-align: ${textAlign};
            `}
            readOnly={!isEditable}
            onBlur={()=> {
              if (text[0].children) {
                if (text[0].children[0].text==="") {
                  actions.delete(id)
                }
              }
            }}
          />
        </CondWrapper>
        {/* must use isActive to limit the modals!! */}
        {(isActive || presentationMode) &&  
          <PopupEditor 
            setProp={setProp}
            open={richTextMode || presentationMode} 
            content={text}
            onChange={editorContentChangeHandler}
            applyChange={applyChange}
            presentationMode={presentationMode}
          />
        }
      </div>
      </Resizer>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    fontSize,
    fontColor,
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    fontColor: node.data.props.fontColor
  }));

  return (
    <>
      <FormControl fullWidth={true} size="small" component="fieldset" margin="normal">
        <FormLabel component="legend">Font size</FormLabel>
        <Slider
          value={fontSize || 2}
          step={1}
          min={12}
          max={30}
          onChange={(_, value) => {
            setProp((props) => (props.fontSize = value), 1000);
          }}
        />
      </FormControl>
      <FormControl size="small" fullWidth={true} component="fieldset" sx={{ml: '3px', pb: 1}} >
        <FormControlLabel control={<MuiSwitch defaultChecked onChange={(e)=> {
            setProp(props=>props.fontColor=OnOffColor[e.target.checked])
        }} />} 
          label={`${fontColor}`}
        />
      </FormControl>
    </>
  );
};

function PopupEditor({open, content, onChange, applyChange, setProp, presentationMode}) {
  const handleApply = () => {
    applyChange()
    setProp(props=>props.richTextMode=false)
  };

  const editorStyle = css`
            overflow-y: auto; 
            overflow-x: hidden; 
            padding: 20px; 
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
            `
  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={()=> {
          if (presentationMode) setProp(props=>props.presentationMode=false)
          else setProp(props=>props.richTextMode=false)
        }}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {open &&
          <RichEditor 
            simpleMode={false}
            withToolbar={!presentationMode}
            initialValue={content} 
            onChange={onChange}
            readOnly={presentationMode}
            editorStyle={editorStyle}
          />
        }
        <DialogActions>
          {!presentationMode? 
            <Button onClick={handleApply}>Apply Change</Button>
            :
            <Button onClick={
              ()=>setProp(props=>props.presentationMode=false)}>
              Close
            </Button>
          }
        </DialogActions>
      </Dialog>
    </div>
  );
}

const CondWrapper = ({ children, condition, wrapper }) => {
  return condition ? wrapper(children) : children
}

export const TextDefaultProps = {
  text: 'text',
  fontColor: 'black',
  textAreaHeight: null,
  richTextMode: false,
  presentationMode: false,
  fontSize: 14,
};

Text.craft = {
  displayName: 'Text',
  props: {...TextDefaultProps, ...defaultProps, ...ResizerDefaultProps},
  related: {
    settings: TextSettings,
  },
};


        // `${!isEditable ||!globalEnabled?
        //   `column-width: ${resizerWidth};`
        //   : `width: 100%;`}
