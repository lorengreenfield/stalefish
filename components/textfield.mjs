import { html, css, formField, fieldIsTouched, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(300)

let styles = css`
  .textfield {
    padding: 10px;
    border: solid 5px #c9c9c9;
    transition: border 0.3s;
    outline: none;
    width: 100%;
    font-size: 18px;
    border-radius: 0;
    box-shadow: none !important;
    font-weight: normal;
    box-sizing: border-box;
    font-family: inherit;
    line-height: 1.4em;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    z-index: 20;
    position: relative;
  }

  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    user-select: none;
    position: absolute;
    top: -55px;
    z-index: 10;
  }

  .textfield.highlight {
    border-color: #ff4081;
  }

  .textfield:focus {
    border: solid 5px #969696;
  }

  .textfield::placeholder {
    color: #999;
  }

  .textfield.touched:invalid:not(:focus) {
    border-color: red;
  }

  .valueContext {
    position: absolute;
    color: #AAA;
    font-size: 1.1em;
    line-height: 1.2em;
    font-weight: normal;
    box-sizing: border-box;
    top: -12px;
    right: 7px;
    background-color: #EEE;
    padding: 10px;
    z-index: 30;
  }
`

function change ({e, holdingPen, property, label}) {
  let ff = formField(holdingPen, property)(e)
  let closestLabel = e.target.closest('label')
  let labelEl = closestLabel.querySelector(label.selector)
  if (labelEl) {
    if (holdingPen[property] === 0 || holdingPen[property]) {
      labelEl.style.opacity = 1
    } else {
      labelEl.style.opacity = 0
    }
  }

  return ff
}

function determineType (type) {
  if (type.toLowerCase() === 'float' || type.toLowerCase() === 'integer') {
    return 'number'
  }

  return type || 'input'
}

function determineStep (type) {
  if (type.toLowerCase() === 'float' || type.toLowerCase() === 'number') {
    return '0.1'
  }

  return '1'
}

class Textfield extends Component {
  createElement (args) {
    this.args = clone(args)
    this.onkeyup = args.onkeyup
    this.oninput = args.oninput
    this.onchange = args.onchange

    let {highlightBorder = false, wrapperStyle = null, holdingPen, label, placeholder, property, required, pattern, type, autofocus, valueContext, permanentTopPlaceholder = false, disabled} = args

    return html`
      <div ${wrapperStyle ? {'class': wrapperStyle} : ''} style="display: inline-block; width: calc(100% - 10px); margin: 40px 5px 5px 5px;">
         <label style="width: 100%; text-align: left; position: relative; padding: 0;">
         ${valueContext ? html`<div class="${styles.valueContext}">${valueContext}</div>` : ''}
         ${label ? html`<span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || permanentTopPlaceholder ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}${required ? ' *' : ''}</span>` : ''}
         <input ${disabled ? {disabled} : ''} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}" class="${styles.textfield} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''} ${highlightBorder ? styles.highlight : ''}" value="${holdingPen[property] || ''}" onkeyup=${e => this.onkeyup && this.onkeyup(e)} ${required ? {required: 'required'} : ''} onchange=${e => { change({e, holdingPen, property, label: styles.label}); this.onchange && this.onchange(e) }} oninput=${e => { change({e, holdingPen, property, label: styles.label}); this.oninput && this.oninput(e) }} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}${required ? ' *' : ''}" type="${determineType(type)}" ${autofocus ? {autofocus} : ''}  ${pattern ? {pattern} : ''} ${type.toLowerCase() === 'number' ? {step: determineStep(type)} : ''} />
         </label>
      </div>
      `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    Object.keys(diff).forEach(key => {
      if(typeof diff[key] === 'function'){
        this[key] = args[key]
      }
    })
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function textfield (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Textfield()
      cache.set(args.uniqueKey, instance)
    }
    return instance.render(args)
  } else {
    instance = new Textfield()
    return instance.createElement(args)
  }
}

export default args => textfield(args)
