import { html, css, geb, Component } from 'halfcab'
import close from './icons/close'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

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

class Toast extends Component {
  createElement (args) {
    this.args = clone(args)
    let {on, message, colour, multiline, closeAction} = args
    return html`
      <div class="${styles.toastContainer}" onclick=${() => geb.broadcast('errorDismissed')} style="${on ? 'bottom: 0px;' : `bottom: -${multiline ? '100' : '50'}px; opacity: 0; `}${multiline ? 'height: 100px;' : ''}">
          <div class="${styles.toast}" style="background-color: ${colour || 'red'};">
              <div style="width: 100%; margin-left: 20px">${message}</div>
              <div style="margin-right: 10px; cursor: pointer;" onclick=${e => closeAction && closeAction(e)}>${close({colour: 'white'})}</div>
          </div>
      </div>
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

let toast = new Toast()
export default args => toast.render(args)
