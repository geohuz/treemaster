import useResizeObserver from 'use-resize-observer'
import { useNode } from '@craftjs/core';
import React, { useCallback, useMemo, useImperativeHandle, forwardRef } from 'react'
import isHotkey from 'is-hotkey'
import { jsx } from 'slate-hyperscript'
import { Point, Node, Transforms, createEditor, Editor, Element as SlateElement } from 'slate'
import escapeHtml from 'escape-html'
import { Text } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  useSlate
} from 'slate-react'


import { Button, Icon, Toolbar } from './RichEditorComponents'
import { css } from '@emotion/react'
import baseStyle from './richEditorBaseStyle'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}


const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const ELEMENT_TAGS = {
  A: el => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
}

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}

export const deserializeHtml = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return '\n'
  }

  const { nodeName } = el
  let parent = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  let children = Array.from(parent.childNodes)
    .map(deserializeHtml)
    .flat()

  if (children.length === 0) {
    children = [{ text: '' }]
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el)
    return jsx('element', attrs, children)
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map(child => jsx('text', attrs, child))
  }

  return children
}

export const serialize = node => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text)
    if (node.bold) {
      string = `<strong>${string}</strong>`
    }
    return string
  }

  const children = node.children.map(n => serialize(n)).join('')
  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`
    case 'paragraph':
      return `<p>${children}</p>`
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

const RichEditor = forwardRef((props, ref) => {
  const refEditable = React.useRef(null);
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => 
    withHtml(withReact(withHistory(createEditor()))), [])

  const {
    nodeProps,
    actions: { setProp },
  } = useNode(node => {
    return {
      nodeProps: node.data.props
    }
  });

  useResizeObserver(
    {
     ref: refEditable,
     onResize: ({height}) => {
      // set the textArea height for resizer to calc
      setProp(props=> {
        props.textAreaHeight = height
      })
     },
    }
  )

  // for simpleEditor to change the content
  useImperativeHandle(ref, ()=> ({
    applyContent(data) {
      resetNodes(editor, {nodes: data} )
    }
  }))

  return (
    <Slate editor={editor} 
      initialValue={props.initialValue}
      onChange={props.onChange}
    >
      {props.withToolbar 
        && 
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <BlockButton format="justify" icon="format_align_justify" />
        </Toolbar>}
      <div
        ref={refEditable}
        // only deal with cutoff in readonly and simpleEditorMode 
        css={css`${props.readOnly && props.simpleMode &&
          `
          height: 100%;
          overflow: hidden;
          column-width: ${nodeProps.width}
          `}
        `}
      >
      <Editable
        css={css`
          ${baseStyle};
          ${props.editorStyle}`
        }
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="type something..."
        autoFocus
        onBlur={()=> {
          Transforms.select(editor, {
            anchor: Editor.start(editor,[]),
            focus: Editor.start(editor, [])
          })
          props.onBlur?.() 
          return true
        }}
        readOnly={props.readOnly} 
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
      </div>
    </Slate>
  )
})

export const withHtml = editor => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const html = data.getData('text/html')

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const fragment = deserializeHtml(parsed.body)
      Transforms.insertFragment(editor, fragment)
      return
    }

    insertData(data)
  }

  return editor
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({attributes, children, element})=> {
  const style = { textAlign: element.align }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (<ul style={style} {...attributes}>{children}</ul>)
    case 'heading-one':
      return (<h1 style={style} {...attributes}>{children}</h1>)
    case 'heading-two':
      return (<h2 style={style} {...attributes}>{children}</h2>)
    case 'heading-three':
      return (<h3 style={style} {...attributes}>{children}</h3>)
    case 'heading-four':
      return (<h4 style={style} {...attributes}>{children}</h4>)
    case 'heading-five':
      return (<h5 style={style} {...attributes}>{children}</h5>)
    case 'heading-six':
      return (<h6 style={style} {...attributes}>{children}</h6>)
    case 'list-item':
      return (<li style={style} {...attributes}>{children}</li>)
    case 'numbered-list':
      return (<ol style={style} {...attributes}>{children}</ol>)
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      )
    default:
      return (<p style={style} {...attributes}>{children}</p>)
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

export function resetNodes (editor, options) {
    const children = [...editor.children]

    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }))

    if (options.nodes) {
      const nodes = Node.isNode(options.nodes) ? [options.nodes] : options.nodes

      nodes.forEach((node, i) => editor.apply({ type: 'insert_node', path: [i], node: node }))
    }

    const point = options.at && Point.isPoint(options.at)
      ? options.at
      : Editor.end(editor, [])

    if (point) {
      Transforms.select(editor, point)
    }
  }


export default RichEditor
