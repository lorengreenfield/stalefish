import {html, css, formField, formIsValid, attribute} from 'halfcab'

let styles = css`
    .textfield {
      padding: 10px;
      border: solid 5px #c9c9c9;
      transition: border 0.3s;
      outline: none;
      margin-top: 10px;
      width: 80%;
      font-size: 18px;
    }
    
    .textfield:focus,
    .textfield.focus {
      border: solid 5px #969696;
    }
`

export default ({holdingPen, name, property, required, pattern, type, keyup, autofocus}) => html`

    <input class="${styles.textfield}" value="${holdingPen[property]}" onfocus=${e => e.currentTarget.classList.add('sf-touched')} onkeyup=${e => keyup(e)} ${required ? `required` : ''} oninput=${formField(holdingPen, property)} placeholder="${name || ''}" type="${type}" style="${!formIsValid(holdingPen) ? '' : ''}" ${attribute(autofocus ? 'autofocus' : '')} />
    
`