import { html, css, Component } from 'halfcab'

let styles = css`
  .progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    display: block;
    width: 100%;
    background-color: white;
    background-clip: padding-box;
    overflow: hidden;
    z-index: 999999;
  }
  
  .progress:before {
      content: '';
      position: absolute;
      background-color: #4371AD;
      top: 0;
      left: 0;
      bottom: 0;
      will-change: left, right;
      animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      -webkit-animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;   
  }
  
  .progress:after {
      content: '';
      position: absolute;
      background-color: #4371AD;
      top: 0;
      left: 0;
      bottom: 0;
      will-change: left, right;
      animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
      animation-delay: 1.15s;
      -webkit-animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
      -webkit-animation-delay: 1.15s;
  }
  
  @keyframes indeterminate {
    0% {
      left: -35%;
      right: 100%; }
    60% {
      left: 100%;
      right: -90%; }
    100% {
      left: 100%;
      right: -90%; } }
  
  @keyframes indeterminate-short {
    0% {
      left: -200%;
      right: 100%; }
    60% {
      left: 107%;
      right: -8%; }
    100% {
      left: 107%;
      right: -8%; } }
`

class Loader extends Component {
  createElement ({on}) {
    this.on = on
    return on === true ? html`<div class="${styles.progress} indeterminate"></div>` : html`<div></div>`
  }

  update ({on}) {
    return on !== this.on
  }
}

let loader = new Loader()
export default args => loader.render(args)
