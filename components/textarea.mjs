import { html, css, formField, fieldIsTouched } from 'halfcab'

let styles = css`
  .textarea {
    padding: 10px;
    border: solid 5px #c9c9c9;
    transition: border 0.3s;
    outline: none;
    width: 100%;
    font-size: 18px;
    border-radius: 0;
    box-shadow: none !important;
    font-weight: normal;
    margin: 8px 0 3px 0;
    font-family: inherit;
    line-height: inherit;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  
  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
  }
  
  .textarea:focus {
    border: solid 5px #969696;
  }
  
  .textarea::placeholder {
    color: #999;
  }
  
  .textarea.touched:invalid:not(:focus) {
    border-color: red;
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


export default ({holdingPen, label, placeholder, property, required, pattern, type, keyup, autofocus}) => html`

   <label style="width: 100%; text-align: left;"><span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); ">${label}${required ? ' *' : ''}</span><textarea class="${styles.textarea} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" onkeyup=${e => keyup && keyup(e)} ${required ? {required: 'required'} : ''} oninput=${e => change({e, holdingPen, property, label: styles.label})} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}${required ? ' *' : ''}" ${autofocus ? {autofocus} : ''}  ${pattern ? {pattern} : ''}>${holdingPen[property] || ''}</textarea></label>
`