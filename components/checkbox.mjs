import { html, css, formField, fieldIsTouched, cache } from 'halfcab'

let styles = css`
  .checkbox {
    margin: 0 10px 0 20px !important;
  }
  
  .label {
    display: inline-flex; 
    align-items: center;
    border-radius: 0;
    font-size: 18px; 
    font-weight: normal; 
    color: #999; 
    margin: 5px 0px 5px 5px;
    padding: 10px;
    background-color: rgba(255,255,255,0.8);
    border: solid 5px #c9c9c9;
    user-select: none;
  }
  
  .checkbox.touched:invalid:not(:focus) {
    outline: red solid 2px;
  }
`

export default ({holdingPen, label, property, required, indeterminate}) => {
  let checkboxEl = html`<input class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ${holdingPen[property] === true  ? { checked: 'checked' } : ''} onchange=${formField(holdingPen, property)} type="checkbox" ${required ? {required: 'required'} : ''} />`

  checkboxEl.indeterminate = indeterminate || false

  return html`
  <label style="text-align: left; margin: 16px 0 26px 0;">
    <span class="${styles.label}">${label}${required ? ' *' : ''}${checkboxEl}</span>
  </label>
`
}
