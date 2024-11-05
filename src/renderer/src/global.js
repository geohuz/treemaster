export function themeColors() {
  const colors = [
    "primary.light",
    "primary.main",
    "primary.dark",
    "secondary.light",
    "secondary.main",
    "secondary.dark",
    "error.light",
    "error.main",
    "error.dark",
    "warning.light",
    "warning.main",
    "warning.dark",
    "info.light",
    "info.main",
    "info.dark",
    "success.light",
    "success.main",
    "success.dark"
  ]

  function colorHex(theme, colorString) {
    let [p1, p2] = colorString.split('.')
    return theme.palette[p1][p2]
  }

  return [colors, colorHex]
}

