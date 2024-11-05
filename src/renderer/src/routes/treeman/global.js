export const rf_global = {
  fontSize: 14,
  width: 80,  //30
  padding: 5,
  borderWidth: 1,
  height: 50,  // 20
  pathOffset: 5  // 非常重要的属性, 设一个小的值确保默认的step edge有正确拐点数目.
}

// so we determine the actual size of the default node
// export const default_node_dim = {
//   width: rf_global.width  + rf_global.padding * 2  + rf_global.borderWidth * 2,
//   height: rf_global.height + rf_global.borderWidth * 2
// }

// but for tailwind we just use the acutal dim
export const default_node_dim = {
  width: rf_global.width,
  height: rf_global.height 
}

export const nodeHSpacing = 20 
export const nodeVSpacing = 20
export const layoutDir = {dir: "TB"} 

export const fileOpts = {
  types: [
    {
      description: "Text file",
      accept: {"application/json": [".json"]},
    }
  ]
}

// export const dirHandle = {
//   sibling: {src: "right", tgt: "left", sh: 'sr', th: 'tl'}, 
//   top: {src: "top", tgt: "bottom", sh: 'tt', th: 'sb'}, 
//   bottom: {src: "bottom", tgt: "top", sh: 'sb', th: 'tt'}
// }

// 几个方向特点
// 1. 一般方向. 2. 反方向 3. sib方向
// 一般方向和sib方向都按常规组合src/tgt
// 只有反方向需要调整

export const dirMatrix = {
  DOWN: { 
    // For Handle component
    handleNorm: ["Top", "Bottom"],
    handleSib: ["Right", "Left"],
    reverse: "Top",
    // For Button
    buttonNorm: ["Top", "Bottom"],
    buttonSib: ["sibling"],
    sibling: "Right"
  },
  RIGHT: {
    handleNorm: ["Left", "Right"],
    handleSib: ["Top", "Bottom"],
    reverse: "Left",
    buttonNorm: ["Left", "Right"],
    buttonSib: ["sibling"],
    sibling: "Bottom",
  },
  handles: {
    Top: {src: "top", tgt: "bottom", sh: 'st', th: 'tb'}, 
    Bottom: {src: "bottom", tgt: "top", sh: 'sb', th: 'tt'},
    Left: {src: "left", tgt: "right", sh: "sl", th: "tr"},
    Right: {src: "right", tgt: "left", sh: 'sr', th: 'tl'}, 
  },
}

