import { html, css, geb } from 'halfcab'
import close from './icons/close'

let styles = css`
  .toast{
    width: 80%;
    min-width: 300px;
    max-width: 600px;
    display: flex;
    align-items: center;
    color: white;
    padding: 10px 0px;
    box-sizing: border-box;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
    pointer-events: auto;
  }
    
  .toastContainer{
    transition: bottom 0.5s ease, opacity 1s ease;
    width: 100%;
    height: 50px;
    position: fixed;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    left: 0px;
    z-index: 999998;
    pointer-events: none;
  }
`
export default ({on, message, colour, multiline, closeAction}) => html`
  <div class="${styles.toastContainer}" onclick=${() => geb.broadcast('errorDismissed')} style="${on ? 'bottom: 0px;' : `bottom: -${multiline ? '100' : '50'}px; opacity: 0; `}${multiline ? 'height: 100px;' : ''}">
      <div class="${styles.toast}" style="background-color: ${colour || 'red'};">
          <div style="width: 100%; margin-left: 20px">${message}</div>
          <div style="margin-right: 10px; cursor: pointer;" onclick=${e => closeAction && closeAction(e)}>${close({colour: 'white'})}</div>
      </div>
  </div>
`
