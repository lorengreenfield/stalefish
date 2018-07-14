import { html, css, formField, fieldIsTouched, injectHTML } from 'halfcab'
import solidDown from './solidDown'

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
    margin: 40px 0px 5px 5px;
    font-family: inherit;
    line-height: inherit;
    max-width: 260px;
    width: 96%;
    position: relative;
    z-index: 2;
  }
  
  .selectBox:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
  
  .label {
    z-index: 1;
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
    user-select: none;
    position: absolute; 
    top: -53px; 
    left: 5px; 
    font-size: 16px; 
    font-weight: normal; 
    color: #999; 
    margin-left: 5px; 
    padding: 9px; 
    background-color: rgba(255,255,255,0.8); 
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
    top: -14px;
    font-size: 2em;
    z-index: 3;
  }
`

export default ({holdingPen, label, property, options, required, onchange, oninput}) => {
  let currentOption = options.find(option => {
    if(typeof option === 'object'){
      return option.value === holdingPen[property]
    } else {
      return option === holdingPen[property]
    }
  })
  return html`
  <label style="text-align: left; position: relative;">
    <div class="${styles.down}">${solidDown({colour: '#ccc'})}</div>
    <span class="${styles.label}">${label}${required ? ' *' : ''}</span>
    <select style="background-color: ${typeof currentOption === 'object' && currentOption.colour ? `#${currentOption.colour}` : 'white'}" class="${styles.selectBox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" oninput=${e => {oninput && oninput(e); return formField(holdingPen, property)(e)}} onchange=${e => {onchange && onchange(e); return formField(holdingPen, property)(e)}} onblur=${formField(holdingPen, property)}>
      <option value="${required ? 'Select an option' : ''}" ${holdingPen[property] === '' ? {selected: 'true'} : ''} ${required ? {disabled: 'disabled'} : ''}>${required ? 'Select an option' : ''}</option>
      ${options.map(option => {
    let optionValue
    if(typeof option === 'object' && option.value !== undefined){
      optionValue = option.value
    } else {
      optionValue = option
    }
    return html`<option value="${optionValue}" ${holdingPen[property] === optionValue ? {selected: 'true'} : ''}>${optionValue}</option>`
  })}
    </select>
  </label>
`
}
