import { html, css, formField, fieldIsTouched } from 'halfcab'

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
    margin: 8px 0;
  }
  
  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
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
    font-weight: normal; 
    box-sizing: 
    border-box; 
    top: 37px; 
    right: 7px; 
    background-color: #EEE; 
    padding: 10px;
    z-index: 2;
  }
`

function change({e, holdingPen, property, label}){
  let ff = formField(holdingPen, property)(e)
  if(holdingPen[property] === 0 || holdingPen[property]){
    e.target.closest('label').querySelector(label.selector).style.opacity = 1
  }else{
    e.target.closest('label').querySelector(label.selector).style.opacity = 0
  }

  return ff
}


export default ({holdingPen, label, placeholder, property, required, pattern, type, keyup, autofocus, valueContext}) => html`

   <label style="width: 100%; text-align: left; position: relative;">
   ${valueContext ? html`<div class="${styles.valueContext}">${valueContext}</div>` : ''}
   <span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}</span>
   <input class="${styles.textfield} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] || ''}" onkeyup=${e => keyup && keyup(e)} ${required ? {required: 'required'} : ''} oninput=${e => change({e, holdingPen, property, label: styles.label})} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}" type="${type || 'input'}" ${autofocus ? {autofocus} : ''}  ${pattern ? {pattern} : ''} />
   </label>
`