import { html, css, formField, fieldIsTouched, injectHTML } from 'halfcab'
import moreVertical from './moreVertical'

let styles = css`
  .selectBox {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding: 10px;
    border: solid 5px #c9c9c9;
    outline: none;
    width: 100%;
    font-size: 18px;
    border-radius: 0;
    font-weight: normal;
    margin: 8px 0;
    background-color: white;
    font-family: inherit;
    line-height: inherit
  }
  
  .selectBox:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
  
  .label {
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
  }
  
  .selectBox:focus {
    border: solid 5px #969696;
  }
  
  .selectBox.touched:invalid:not(:focus) {
    border-color: red;
  }
  
  .down {
    position: absolute;
    pointer-events: none;
    color: #c9c9c9;
    right: 20px;
    top: 36px;font-size: 2em;
  }
  
`


export default ({holdingPen, label, property, options, required}) => html`
  <label style="width: 100%; text-align: left; position: relative;">
  <div class="${styles.down}">▾</div>
  <span class="${styles.label}" style="font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}${required ? ' *' : ''}</span>
    <select class="${styles.selectBox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" oninput=${formField(holdingPen, property)} onblur=${formField(holdingPen, property)}>
      <option value="${required ? 'Select an option' : ''}" ${holdingPen[property] === '' ? {selected: 'true'} : ''} ${required ? {disabled: 'disabled'} : ''}>${required ? 'Select an option' : ''}</option>
      ${options.map(option => {
  return html`<option value="${option}" ${holdingPen[property] === option ? {selected: 'true'} : ''}>${option}</option>`
})}
    </select>
  </label>
`