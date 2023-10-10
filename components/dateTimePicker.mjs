import { html, css, formField, fieldIsTouched, Component, LRU } from 'halfcab'
import flatpickr from 'flatpickr'
import calendarIcon from './icons/calendarIcon.mjs'
import timeIcon from './icons/timeIcon.mjs'
import clone from 'fast-clone'
import * as deepDiff from 'deep-object-diff'

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
    height: 55px;
    background-color: #FFF;
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
  
  .textfield:focus {
    border: solid 5px #969696;
  }
  
  .textfield::placeholder {
    color: #999;
  }
  
  .textfield.touched:invalid:not(:focus) {
    border-color: red;
  }
  
  .icon {
    position: absolute;
    pointer-events: none;
    color: #c9c9c9;
    right: 12px;
    font-size: 2em;
    z-index: 30;
    position: absolute; 
    top: 9px; 
  }
  
  .clear {
    cursor: pointer;
    position: absolute;
    color: #AAA;
    font-size: 0.8em; 
    line-height: 0.9em;
    font-weight: normal; 
    box-sizing: border-box;
    top: -1px; 
    right: 40px; 
    background-color: #EEE; 
    padding: 5px 10px;
    z-index: 30;
    border-radius: 3px;
    position: absolute; 
    top: 17px; 
  }
`

function change ({ e, holdingPen, property }) {
  let ff = formField(holdingPen, property)(e)
  // e.target.focus()
  return ff
}

function detectTouchscreen () {
  var result = false
  if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
    // if Pointer Events are supported, just check maxTouchPoints
    if (navigator.maxTouchPoints > 0) {
      result = true
    }
  } else {
    // no Pointer Events...
    if (window.matchMedia && window.matchMedia('(any-pointer:coarse)').matches) {
      // check for any-pointer:coarse which mostly means touchscreen
      result = true
    } else if (window.TouchEvent || ('ontouchstart' in window)) {
      // last resort - check for exposed touch events API / event handler
      result = true
    }
  }
  return result
}

class DateTimePicker extends Component {
  createElement (args) {
    this.args = clone(args)
    this.onchange = args.onchange
    this.oninput = args.oninput

    let { wrapperStyle = null, holdingPen, label, placeholder, property, required, pattern, permanentTopPlaceholder = true, permanentTopLabel = false, flatpickrConfig = {}, timeOnly = false, disabled, disableClear = false } = args

    let el = html`
    <div ${wrapperStyle ? { 'class': wrapperStyle } : ''} style="min-height: 55px; display: inline-block; width: calc(100% - 10px); margin: 40px 5px 5px 5px;">
       <div style="display: inline-block; width: 100%; text-align: left; position: relative; padding: 0;">
       <div class="${styles.icon}">${timeOnly ? timeIcon({ colour: '#ccc' }) : calendarIcon({ colour: '#ccc' })}</div>
       ${label ? html`<span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || (permanentTopPlaceholder || permanentTopLabel) ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); position: absolute; top: -36px;">${label}${required ? ' *' : ''}</span>` : ''}
       ${!disableClear ? html`<div data-clear class="${styles.clear}" onclick=${e => {
    e.stopPropagation()
    e.preventDefault()
    e.target.parentNode.parentNode._flatpickr.clear()
    e.target.parentNode.parentNode._flatpickr.close()
    return false
  }}>clear</div>` : ''}
       <input data-gramm="false" ${disabled ? { disabled } : ''} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}" class="${styles.textfield} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" ${required ? { required: 'required' } : ''} onfocus=${e => {
  e.target.parentNode.parentNode._flatpickr && e.target.parentNode.parentNode._flatpickr.set('onValueUpdate', (fpDate, dateString) => {
    let fauxE = {
      currentTarget: {
        validity: {
          valid: true
        },
        value: dateString
      }
    }
    formField(holdingPen, property)(fauxE)
    this.onchange && this.onchange(fauxE)
  })
}} onchange=${e => { change({ e, holdingPen, property, label: styles.label }); this.onchange && this.onchange(e) }} oninput=${e => { e.target.defaultValue = ''; this.oninput && this.oninput(e) }} placeholder="${placeholder || ''}${required ? ' *' : ''}" type="${detectTouchscreen() ? timeOnly ? 'time' : 'date' : 'text'}" ${pattern ? { pattern } : ''} value="${holdingPen[property] || ''}" data-input />
       </div>
    </div>
    `

    this.flatpickr = flatpickr(el, Object.assign(flatpickrConfig, {
      wrap: true,
      onValueUpdate: (fpDate, dateString) => {
        let fauxE = {
          currentTarget: {
            validity: {
              valid: true
            },
            value: dateString
          }
        }
        formField(holdingPen, property)(fauxE)
        this.onchange && this.onchange(fauxE)
      }
    }, timeOnly ? { noCalendar: true, enableTime: true } : null))

    return el
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

function dateTimePicker (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new DateTimePicker()
      cache.set(args.uniqueKey, instance)
    }
    return instance.render(args)
  } else {
    instance = new DateTimePicker()
    return instance.createElement(args)
  }
}

export default args => dateTimePicker(args)
