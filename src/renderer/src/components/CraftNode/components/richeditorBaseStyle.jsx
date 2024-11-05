import {css} from '@emotion/react'

const baseStyle = css`
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67__qem;
    margin-block-end: 0.67em;
    margin-inline-start: 0;
    margin-inline-end: 0;
    font-weight: bold
}

h2 {
    display: block;
    font-size: 1.5em;
    margin-block-start: 0.83__qem;
    margin-block-end: 0.83em;
    margin-inline-start: 0;
    margin-inline-end: 0;
    font-weight: bold
}

ul, menu, dir {
    display: block;
    list-style-type: disc;
    margin-block-start: 1__qem;
    margin-block-end: 1em;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 40px
}

ol {
    display: block;
    list-style-type: decimal;
    margin-block-start: 1__qem;
    margin-block-end: 1em;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 40px
}

li {
    display: list-item;
    text-align: -webkit-match-parent;
}

ul ul, ol ul {
    list-style-type: circle
}

ol ol ul, ol ul ul, ul ol ul, ul ul ul {
    list-style-type: square
}

dd {
    display: block;
    margin-inline-start: 40px
}

dl {
    display: block;
    margin-block-start: 1__qem;
    margin-block-end: 1em;
    margin-inline-start: 0;
    margin-inline-end: 0;
}

dt {
    display: block
}

ol ul, ul ol, ul ul, ol ol {
    margin-block-start: 0;
    margin-block-end: 0
}

textarea {
  font-family: 'Roboto', sans-serif;
  line-height: 1.4;
  background: #eee;
}

p {
  margin: 0;
}

pre {
  padding: 10px;
  background-color: #eee;
  white-space: pre-wrap;
}

:not(pre) > code {
  font-family: monospace;
  background-color: #eee;
  padding: 3px;
}

img {
  max-width: 100%;
  max-height: 20em;
}

blockquote {
  border-left: 2px solid #ddd;
  margin-left: 0;
  margin-right: 0;
  padding-left: 10px;
  color: #aaa;
  font-style: italic;
}

blockquote[dir='rtl'] {
  border-left: none;
  padding-left: 0;
  padding-right: 10px;
  border-right: 2px solid #ddd;
}

table {
  border-collapse: collapse;
}

td {
  padding: 10px;
  border: 2px solid #ddd;
}

input {
  box-sizing: border-box;
  font-size: 0.85em;
  width: 100%;
  padding: 0.5em;
  border: 2px solid #ddd;
  background: #fafafa;
}

input:focus {
  outline: 0;
  border-color: blue;
}

iframe {
  width: 100%;
  border: 1px solid #eee;
}

[data-slate-editor] > * + * {
  margin-top: 1em;
}
`

export default baseStyle
