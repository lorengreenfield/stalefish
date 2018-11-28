import { html, css, formField, fieldIsTouched, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(300)

let styles = css`
  .textarea {
    padding: 10px;
    border: solid 5px #c9c9c9;
    transition: border 0.3s;
    outline: none;
    font-size: 18px;
    border-radius: 0;
    box-shadow: none !important;
    font-weight: normal;
    margin: 24px 5px 5px 5px;
    font-family: inherit;
    line-height: inherit;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    box-sizing: border-box; 
    width: calc(100% - 10px);
    resize: vertical;
  }
  
  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
    user-select: none;
    position: relative; 
    top: 14px;
    left: 5px
  }
  
  .textarea:focus {
    border: solid 5px #969696;
  }
  
  .textarea::placeholder {
    color: #999;
  }
  
  .textarea.touched:invalid:not(:focus) {
    border-color: red;
  }
`

function change ({e, holdingPen, property, label}) {
  let ff = formField(holdingPen, property)(e)
  if (holdingPen[property] === 0 || holdingPen[property]) {
    e.target.closest('label').querySelector(label.selector).style.opacity = 1
  } else {
    e.target.closest('label').querySelector(label.selector).style.opacity = 0
  }

  return ff
}

class Textarea extends Component {
  createElement (args) {
    this.args = clone(args)
    this.onchange = args.onchange
    this.oninput = args.oninput

    let {holdingPen, label, placeholder, property, required, pattern, onkeyup, autofocus, permanentTopPlaceholder = false, disabled} = args

    return html`
       <label ${disabled ? {disabled} : ''} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}width: 100%; text-align: left; display: inline-block;"><span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || permanentTopPlaceholder ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}${required ? ' *' : ''}</span><textarea style="${this.height ? `height: ${this.height}` : ''}" class="${styles.textarea} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" onkeyup=${e => onkeyup && onkeyup(e)} ${required ? {required: 'required'} : ''} onchange=${e => { change({e, holdingPen, property, label: styles.label}); this.onchange && this.onchange(e) }} oninput=${e => { this.height = window.getComputedStyle(this.element.querySelector('textarea')).height; change({e, holdingPen, property, label: styles.label}); this.oninput && this.oninput(e) }} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}${required ? ' *' : ''}" ${autofocus ? {autofocus} : ''}  ${pattern ? {pattern} : ''}>${holdingPen[property] || ''}</textarea></label>
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    Object.keys(diff).forEach(key => {
      if (typeof diff[key] === 'function') {
        this[key] = args[key]
      }
    })
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function textarea (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Textarea()
      cache.set(args.uniqueKey, instance)
    }
    return instance.render(args)
  } else {
    instance = new Textarea()
    return instance.createElement(args)
  }
}

export default args => textarea(args)
