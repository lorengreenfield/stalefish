import { html, css } from 'halfcab'

const styles = css`
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown:focus{
    outline:0;
  }

  .dropdownContent {
    position: absolute;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  .dropdownContent div {
    color: #666;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    font-size: 18px;
  }

  .dropdownContent div:hover { background-color: #f1f1f1 }

  .separator{
    border-color: #c9c9c9;
    margin: 0;
    border-style: solid;
  }
`

export default ({ menuItems = [], options = [], visible = true, side, width, margin, backgroundColour }) => {
  const items = Array.isArray(menuItems) ? menuItems : (Array.isArray(options) ? options : [])
  const filtered = items.filter(item => {
    if (!item) return false
    return true
  })

  const limits = [...new Set(filtered.map(item => item.visibleUnder).filter(v => !!v).map(v => parseInt(v, 10)))]

  return html`
    <style>
      ${limits.map(limit => `
        @media (min-width: ${limit + 1}px) {
          .visible-under-${limit} {
            display: none;
          }
        }
      `).join('')}
    </style>
    <div tabindex="-1" class="${styles.dropdown}" style="position: relative; z-index: 100000; ${!visible ? 'display: none;' : ''}${side === 'right' ? 'float: right;' : ''}">
      <div class="${styles.dropdownContent}" style="background-color: ${backgroundColour || '#f9f9f9'}; ${side === 'right' ? 'right: 0;' : ''} width: ${width || '160px'};${margin ? `margin: ${margin};` : ''}">
        ${filtered.map(item => {
    const label = item.text != null ? item.text : (item.name != null ? item.name : '')
    const disabled = item.disabled === true
    const hasAction = typeof item.action === 'function'
    const limit = item.visibleUnder ? parseInt(item.visibleUnder, 10) : null
    const itemClass = Number.isFinite(limit) ? `visible-under-${limit}` : ''
    if (item.separator) {
      return html`<hr class="${styles.separator} ${itemClass}">`
    }
    if (disabled) {
      return html`<div class="${itemClass}" style="opacity: 0.3; pointer-events: none;">${label}</div>`
    }
    if (hasAction) {
      return html`<div class="${itemClass}" style="cursor: pointer;" onclick=${item.action}>${label}</div>`
    }
    return html`<div class="${itemClass}">${label}</div>`
  })}
      </div>
    </div>
  `
}
