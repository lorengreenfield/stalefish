import { html, css, formField, formIsValid, attribute, fieldIsTouched, rerender } from 'halfcab'

let styles = css`
    .textfield {
      padding: 10px;
      border: solid 5px #c9c9c9;
      transition: border 0.3s;
      outline: none;
      margin-top: 10px;
      width: 80%;
      font-size: 18px;
      border-radius: 0;
      box-shadow: none !important;
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
`

export default ({holdingPen, name, property, required, pattern, type, keyup, autofocus}) => html`

    <input class="${styles.textfield} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property]}" onkeyup=${e => keyup(e)} ${required ? `required` : ''} oninput=${formField(holdingPen, property)} onblur=${formField(holdingPen, property)} placeholder="${name || ''}" type="${type}" style="${!formIsValid(holdingPen) ? '' : ''}" ${attribute(autofocus ? 'autofocus' : '')} />
    
`