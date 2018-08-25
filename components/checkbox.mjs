import { html, css, formField, fieldIsTouched } from 'halfcab'

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

export default ({wrapperStyle, holdingPen, label, property, required, indeterminate, onchange, disabled}) => {
  let checkboxEl = html`<input ${disabled ? {disabled} : ''} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}" class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ${holdingPen[property] === true ? { checked: 'checked' } : ''} onchange=${e => { formField(holdingPen, property)(e); onchange && onchange(e) }} type="checkbox" ${required ? {required: 'required'} : ''} />`

  checkboxEl.indeterminate = indeterminate || false

  return html`
  <label style="text-align: left; width: 100%; display: inline-block; vertical-align: bottom;" ${wrapperStyle ? {'class': wrapperStyle} : ''}>
    <span class="${styles.label}">${label}${required ? ' *' : ''}${checkboxEl}</span>
  </label>
`
}
