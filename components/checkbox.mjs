import { html, css, formField, fieldIsTouched } from 'halfcab'

let styles = css`
  .checkbox {
    margin: 0 10px 0 20px !important;
  }
  
  .label {
    border-radius: 5px;
    font-size: 16px; 
    font-weight: normal; 
    color: #999; 
    margin-left: 5px; 
    padding: 14px; 
    v-align: top; 
    background-color: rgba(255,255,255,0.8); 
  }
  
  .checkbox.touched:invalid:not(:focus) {
    outline: red solid 2px;
  }
`


export default ({holdingPen, label, property, required}) => html`

   <label style="text-align: left; margin: 16px 0 26px 0;">
   <span class="${styles.label}">${label}<input class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ${holdingPen[property] === true  ? { checked: 'checked' } : ''} onchange=${formField(holdingPen, property)} type="checkbox" ${required ? {required: 'required'} : ''} /></span></label>
`