import { html } from 'halfcab'

export default ({ colour, width, height }) => html`
<svg fill="${colour}" height="${height || '24'}" width="${width || '24'}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
  <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`
