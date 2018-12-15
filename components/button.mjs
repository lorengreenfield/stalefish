import { html, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(300)

class Button extends Component {
  createElement (args) {
    this.args = clone(args)
    this.action = args.action
    let {width, minWidth, height, text, colour, disabled} = args

    return html`
        <button style="${disabled ? 'opacity: 0.3;' : ''}font-family: inherit; line-height: inherit; cursor: ${disabled ? 'not-allowed' : 'pointer'}; background-color: ${colour}; ${minWidth ? `min-width: ${minWidth};` : ''} border-radius: 3px; margin: 30px 10px; width: ${width}; height: ${height}; border: none; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); font-size: 17px; color: white;" ${disabled ? 'disabled' : ''} onclick=${e => this.action(e)}>${text}</button> 
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    Object.keys(diff).forEach(key => {
      if (typeof diff[key] === 'function') {
        this[key] = args[key]
      }
    })
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function button (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Button()
      cache.set(args.uniqueKey, instance)
    }
    return instance.render(args)
  } else {
    instance = new Button()
    return instance.createElement(args)
  }
}

export default args => button(args)
