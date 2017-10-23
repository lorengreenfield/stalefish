'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var halfcab = require('halfcab');

let styles = halfcab.css`
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
    
`;

var textfield = ({holdingPen, name, property, required, pattern, type, keyup}) => halfcab.html`

    <input class="${styles.textfield}" value="${holdingPen[property]}" onfocus=${e => e.currentTarget.classList.add('sf-touched')} onkeyup=${e => keyup(e)} ${required ? `required` : ''} oninput=${halfcab.formField(holdingPen, property)} placeholder="${name || ''}" type="${type}" style="${!halfcab.formIsValid(holdingPen) ? '' : ''}" />
    
`;

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

var button = ({width, height, text, action, colour, disabled}) => halfcab.html`
    <button style="cursor: pointer; background-color: ${colour}; border-radius: 3px; margin: 30px 10px; width: ${width}; height: ${height}; border: none; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); font-size: 17px; color: white;" ${disabled ? 'disabled' : ''} onclick=${e => action(e)}>${text}</button> 
`;

var close = ({colour}) => halfcab.html`
<svg fill="${colour}" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg> 
`;

let styles$1 = halfcab.css`
    
    .toast{
        width: 80%;
        min-width: 300px;
        max-width: 600px;
        background-color: red;
        display: flex;
        align-items: center;
        color: white;
        padding: 10px 0px;
        box-sizing: border-box;
    }
    
    .toastContainer{
         transition: bottom 0.5s ease;
         width: 100%;
         height: 50px;
         position: fixed;
         display: flex;
         flex-flow: row wrap;
         justify-content: center;
         left: 0px;
    }
`;

var toast = ({on, message, colour, multiline}) => halfcab.html`

    <div class="${styles$1.toastContainer}" onclick=${e => halfcab.geb.broadcast('errorDismissed')} style="colour: ${colour || 'red'}; ${on ? 'bottom: 0px;' : `bottom: -${multiline ? '100' : '50'}px;`}${multiline ? 'height: 100px;' : ''}">
        <div class="${styles$1.toast}">
            <div style="width: 100%; margin-left: 20px">${message}</div>
            <div style="margin-right: 10px; cursor: pointer;">${close({colour: 'white'})}</div>
        </div>
    </div>
`;

let styles$2 = halfcab.css`

    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown:focus{
        outline:0;
    }
    
    
    .dropdownContent {
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }
    
    
    .dropdownContent div {
        color: #666;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;
        font-size: 18px;
    }
    
    
    .dropdownContent div:hover {background-color: #f1f1f1}
    
    .separator{
        border-color: #c9c9c9;
        margin: 0;
        border-style: solid;
    }
    
`;

var dropdown = ({menuItems, visible, side}) => halfcab.html`

<div tabindex="-1" class="${styles$2.dropdown}" style="${!visible ? 'display: none;' : ''}${side === 'right' ? 'float: right;' : ''}">
  <div class="${styles$2.dropdownContent}" style="${side === 'right' ? 'right: 0;' : ''}">
  ${menuItems.map(item => halfcab.html`
    ${item.separator ? halfcab.html`<hr class="${styles$2.separator}">` : halfcab.html`<div onclick=${item.action}>${item.text}</div>`}
  `)}
  </div>
</div>
    
`;

var moreVertical = ({colour}) => halfcab.html`
<svg fill="${colour}" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
</svg> 
`;

exports.button = button;
exports.textfield = textfield;
exports.toast = toast;
exports.dropdown = dropdown;
exports.moreVertical = moreVertical;
exports.close = close;
