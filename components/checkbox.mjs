import { html, css, formField, fieldIsTouched, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(300)

let styles = css`
  .checkbox {
    margin: 0 10px 0 20px !important;
    position: absolute;
    right: 4px;
    top: 16.5px;
  }
  
  .label {
    position: relative;
    display: inline-flex; 
    align-items: center;
    border-radius: 0;
    font-size: 18px; 
    font-weight: normal; 
    color: #999; 
    margin: 5px 5px 5px 5px;
    padding: 10px;
    background-color: rgba(255,255,255,0.8);
    border: solid 5px #c9c9c9;
    user-select: none;
    padding: 12px; 
    box-sizing: border-box;
    width: calc(100% - 10px);
  }
  
  .checkbox.touched:invalid:not(:focus) {
    outline: red solid 2px;
  }
`

class Checkbox extends Component {
  createElement (args) {
    this.args = clone(args)
    let {wrapperStyle, holdingPen, label, property, required, indeterminate, onchange, disabled} = args

    let checkboxEl = html`<input ${disabled ? {disabled} : ''} style="${disabled ? 'cursor: not-allowed;' : ''}" class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ${holdingPen[property] === true ? {checked: 'checked'} : ''} onchange=${e => {
      formField(holdingPen, property)(e)
      onchange && onchange(e)
    }} type="checkbox" ${required ? {required: 'required'} : ''} />`

    checkboxEl.indeterminate = indeterminate || false

    return html`
      <label style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}text-align: left; width: 100%; display: inline-block; vertical-align: bottom;" ${wrapperStyle ? {'class': wrapperStyle} : ''}>
        <span class="${styles.label}">${label}${required ? ' *' : ''}${checkboxEl}</span>
      </label>
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function checkbox (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Checkbox()
      cache.set(args.uniqueKey, instance)
    }
  } else {
    instance = new Checkbox()
  }
  return instance.render(args)
}

export default args => checkbox(args)
