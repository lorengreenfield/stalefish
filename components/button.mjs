import { html } from 'halfcab'

export default ({width, minWidth, height, text, action, colour, disabled, uniqueKey}) => html`
    <button style="${disabled ? 'opacity: 0.3;' : ''}font-family: inherit; line-height: inherit; cursor: ${disabled ? 'not-allowed' : 'pointer'}; background-color: ${colour}; ${minWidth ? `min-width: ${minWidth};` : ''} border-radius: 3px; margin: 30px 10px; width: ${width}; height: ${height}; border: none; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); font-size: 17px; color: white;" ${disabled ? 'disabled' : ''} onclick=${e => action(e)}>${text}</button> 
`
