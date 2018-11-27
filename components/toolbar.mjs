import { html, css, Component } from 'halfcab'
import clone from 'fast-clone'
import * as deepDiff from 'deep-object-diff'

let styles = css`
  .toolbar {
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100000;
    display: flex;
    box-sizing: border-box;
    width: 100%;
    background-color: #212121;
    height: 60px;
  }
`

class Toolbar extends Component {
  createElement (args) {
    this.args = clone(args)
    let {content} = args
    return html`
      <div class="${styles.toolbar}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          ${typeof content === 'function' ? content() : content}
        </div>
      </div>
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

let toolbar = new Toolbar()
export default args => toolbar.render(args)
