import { html, css, formField, fieldIsTouched } from 'halfcab'
import solidDown from './icons/solidDown.mjs'

const styles = css`
  .selectBox {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding: 12px;
    border: solid 5px #c9c9c9;
    outline: none;
    width: 100%;
    font-size: 18px;
    border-radius: 0;
    font-weight: normal;
    margin: 40px 5px 5px 5px;
    font-family: inherit;
    line-height: inherit;
    width: calc(100% - 10px);
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
    top: 4px; 
    left: 5px; 
    font-size: 16px; 
    font-weight: normal; 
    color: #999; 
    margin-left: 5px; 
    padding: 9px; 
    background-color: rgba(255,255,255,0.8); 
    box-sizing: border-box;
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
    top: 44px;
    font-size: 2em;
    z-index: 3;
  }
`

export default ({ wrapperStyle = null, holdingPen, label, property, options, required, disabled, onchange, oninput }) => {
  const currentOption = options.find(option => {
    if (typeof option === 'object') {
      return option.value === holdingPen[property]
    } else {
      return option === holdingPen[property]
    }
  })
  // text color is always #999 per latest design; placeholder state no longer affects color

  return html`
    <label style="text-align: left; position: relative; display: inline-block; width: 100%;" ${wrapperStyle ? { class: wrapperStyle } : ''}>
      <div class="${styles.down}">${solidDown({ colour: '#ccc' })}</div>
      <span class="${styles.label}">${label}${required ? ' *' : ''}</span>
      <select ${disabled ? { disabled } : ''} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}background-color: ${typeof currentOption === 'object' && currentOption.colour ? `#${currentOption.colour}` : 'white'}; color: #999;" class="${styles.selectBox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" oninput=${e => { formField(holdingPen, property)(e); oninput && oninput(e) }} onchange=${e => { formField(holdingPen, property)(e); onchange && onchange(e) }} onblur=${formField(holdingPen, property)}>
        <option value="${required ? 'Select an option' : ''}" ?selected=${!holdingPen[property]} ?disabled=${required} : ''}>${required ? 'Select an option' : ''}</option>
        ${options.map(option => {
    let optionValue
    let optionName
    if (typeof option === 'object' && option.value !== undefined) {
      optionValue = option.value
      optionName = option.name
    } else {
      optionValue = option
    }
    return html`<option value="${optionValue}" ?selected=${holdingPen[property] == optionValue}>${optionName || optionValue}</option>` // eslint-disable-line
  })}
      </select>
    </label>
  `
}
