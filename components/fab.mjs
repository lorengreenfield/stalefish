import { html, injectHTML, css } from 'halfcab'

let styles = css`
  .fab {
     bottom: 15px;
     transition: bottom 0.2s ease;
  }
`
export default ({diameter, text, action, colour, disabled, on, icon}) => html`
<button class="${styles.fab}" onclick=${e => action(e)} 
  ${disabled ? 'disabled' : ''}
  style=" 
  z-index: 19000; 
  background-color: ${colour};
  width: 80px;
  height: 80px;
  outline: none;
  border: none;
  border-radius: 50%;
  font-family: inherit; 
  line-height: inherit; 
  cursor: pointer;
  color: white;
  font-size: 17px;
  position: fixed; 
  right: 15px; 
  bottom: ${on ? '15px' : `-${parseInt(diameter) + 10}px`};
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);">${icon ? injectHTML(icon) : text}</button>
`
