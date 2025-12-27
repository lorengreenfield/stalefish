// Browser stub for @lit-labs/ssr used by halfcab/stalefish examples
// Provide a no-op named export `render` so static imports succeed in the browser.
export function render () {
  // In the browser demo we don't perform SSR; return an empty iterable.
  return []
}

export default { render }
