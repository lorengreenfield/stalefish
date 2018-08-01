import { html, css, formField, fieldIsTouched, cache } from 'halfcab'
import flatpickr from 'flatpickr'
import hash from 'hash-it'
import calendarIcon from './calendarIcon'

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
  
  .icon {
    position: absolute;
    pointer-events: none;
    color: #c9c9c9;
    right: 17px;
    top: -9px;
    font-size: 2em;
    z-index: 30;
  }
`

function change ({e, holdingPen, property, label}) {
  let ff = formField(holdingPen, property)(e)
  e.target.blur()
  return ff
}

const datePicker = ({wrapperStyle = null, onkeyup, holdingPen, label, placeholder, property, required, pattern, autofocus, permanentTopPlaceholder = true, onchange, oninput, flatpickrConfig = {}}) => {
  let el = html`
  <div ${wrapperStyle ? {'class': wrapperStyle} : ''} style="min-height: 55px; display: inline-block; width: calc(100% - 10px); margin: 40px 5px 5px 5px;">
     <label style="width: 100%; text-align: left; position: relative; padding: 0;">
     <div class="${styles.icon}" data-toggle>${calendarIcon({colour: '#ccc'})}</div>
     ${label ? html`<span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || permanentTopPlaceholder ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}${required ? ' *' : ''}</span>` : ''}
     <input class="${styles.textfield} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] || ''}" onkeyup=${e => onkeyup && onkeyup(e)} ${required ? {required: 'required'} : ''} onchange=${e => { change({e, holdingPen, property, label: styles.label}); onchange && onchange(e) }} oninput=${e => { change({e, holdingPen, property, label: styles.label}); oninput && oninput(e) }} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}${required ? ' *' : ''}" type="text" ${autofocus ? {autofocus} : ''}  ${pattern ? {pattern} : ''}  data-input />
     </label>
  </div>
  `

  if (typeof window !== 'undefined') {
    el.id = `datepicker-${hash({wrapperStyle, holdingPen, label, placeholder, property, required, pattern, autofocus, permanentTopPlaceholder, onchange, oninput})}`
    el.isSameNode = target => el.id === target.id
    flatpickr(el, Object.assign(flatpickrConfig, {wrap: true, disableMobile: true}))
  }

  return el
}

export default args => cache(datePicker, args)
