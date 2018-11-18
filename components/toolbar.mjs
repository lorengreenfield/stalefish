import { html, css } from 'halfcab'

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

export default ({content}) => html`
  <div class="${styles.toolbar}">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      ${typeof content === 'function' ? content() : content}
    </div>
  </div>
`
