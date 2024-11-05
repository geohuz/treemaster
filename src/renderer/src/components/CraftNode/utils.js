export function genSlateContent(text) {
  return [{
      type: 'paragraph',
      children: [
        {text: text},
      ]
    }]
}
