import { html, css, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(300)

let styles = css`

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
  
  .dropdownContent div:hover {background-color: #f1f1f1}
  
  .separator{
    border-color: #c9c9c9;
    margin: 0;
    border-style: solid;
  }
`

class Dropdown extends Component {
  createElement (args) {
    this.args = clone(args)
    // TODO - for menu items where the action changes, we need to use this.item.action
    let { menuItems, visible, side, width, margin, backgroundColour } = args

    return html`
    <div tabindex="-1" class="${styles.dropdown}" style="position: relative; z-index: 100000; ${!visible ? 'display: none;' : ''}${side === 'right' ? 'float: right;' : ''}">
      <div class="${styles.dropdownContent}" style="background-color: ${backgroundColour || '#f9f9f9'}; ${side === 'right' ? 'right: 0;' : ''} width: ${width || '160px'};${margin ? `margin: ${margin};` : ''}">
      ${menuItems.filter(item => !item.visibleUnder || (item.visibleUnder && typeof window !== 'undefined' && window.innerWidth <= parseInt(item.visibleUnder)))
    .map(item => html`
        ${item.separator ? html`<hr class="${styles.separator}">` : item.disabled === true ? html`<div style="opacity: 0.3; pointer-events: none;">${item.text}</div>` : html`<div style="cursor: pointer;" onclick=${item.action}>${item.text}</div>`}
      `)}
      </div>
    </div>   
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function dropdown (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Dropdown()
      cache.set(args.uniqueKey, instance)
    }
    return instance.render(args)
  } else {
    instance = new Dropdown()
    return instance.createElement(args)
  }
}

export default args => dropdown(args)
