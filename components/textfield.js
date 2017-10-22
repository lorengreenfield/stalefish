import {html, css, formField, formIsValid} from 'halfcab'

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

export default ({holdingPen, name, property, required, pattern, type, keyup}) => html`

    <input class="${styles.textfield}" value="${holdingPen[property]}" onfocus=${e => e.currentTarget.classList.add('sf-touched')} onkeyup=${e => keyup(e)} ${required ? `required` : ''} oninput=${formField(holdingPen, property)} placeholder="${name || ''}" type="${type}" style="${!formIsValid(holdingPen) ? '' : ''}" />
    
`

/*


import {html, formField} from 'halfcab'

export default ({holdingPen, name, property, styles, type, required, pattern, keyup}) => html`

    <div style="width: 90%;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded" data-mdc-auto-init="MDCTextfield">
        <input style="width: 100%;" value="${holdingPen[property]}" type="${type}"  class="mdc-textfield__input"  />
        <label class="mdc-textfield__label">${name}</label>
        <div class="mdc-textfield__bottom-line"></div>
    </div>
`


 */