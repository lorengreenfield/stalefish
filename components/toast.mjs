import {html, css, geb} from 'halfcab'
import close from './close'

let styles = css`
    
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
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
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
`

export default ({on, message, colour, multiline}) => html`
  <div class="${styles.toastContainer}" onclick=${e => geb.broadcast('errorDismissed')} style="colour: ${colour || 'red'}; ${on ? 'bottom: 0px;' : `bottom: -${multiline ? '100' : '50'}px;`}${multiline ? 'height: 100px;' : ''}">
      <div class="${styles.toast}">
          <div style="width: 100%; margin-left: 20px">${message}</div>
          <div style="margin-right: 10px; cursor: pointer;">${close({colour: 'white'})}</div>
      </div>
  </div>
`