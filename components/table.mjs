import { html, css, Component, LRU } from 'halfcab'
import * as deepDiff from 'deep-object-diff'
import clone from 'fast-clone'

let cache = new LRU(100)

let styles = css`
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .th {
    text-align: left;
    background-color: #F9F9F9;
  }
  
  .thRow {
    background-color: #F9F9F9;
  }
  
  .tr:nth-child(even) {
    background-color: #FDFDFD;
  }
`

let _columns = [
  {
    title: 'Column 1',
    icon: null,
    action: () => { },
    width: '20%'
  }, {
    title: 'Column 2',
    icon: null,
    action: () => { },
    width: '40%'
  }, {
    title: 'Column 3',
    icon: null,
    action: () => { },
    width: '20%'
  }]

let _data = [
  ['C1-R1', 'C2-R1', 'C3-R1'],
  ['C1-R2', () => 'C2-R2', () => 'C3-R2']
]

class Table extends Component {
  createElement (args) {
    this.args = clone(args)
    let {columns = _columns, data = _data} = args

    return html`
       <table class="${styles.table}">
        <thead class="${styles.thRow}">
            <tr>
                ${columns.map(column => html`<th class="${styles.th} ${column.style || ''}" scope="col" ${column.action ? {onclick: column.action} : ''}>${column.title}${column.icon ? column.icon : ''}</th>`)}
            </tr>
        </thead>
        <tbody>
           ${data.map(row => html`<tr class="${styles.tr}">${row.map(column => html`<td class="${column.style || ''}" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap; max-width: 0; direction: rtl;">${typeof column.content === 'function' ? column.content() : column.content}</td>`)}</tr>`)}
        </tbody>
    </table>
    `
  }

  update (args) {
    let diff = deepDiff.diff(this.args, args)
    return !!Object.keys(diff).find(key => typeof diff[key] !== 'function')
  }
}

function table (args) {
  let instance
  if (args.uniqueKey) {
    let found = cache.get(args.uniqueKey)
    if (found) {
      instance = found
    } else {
      instance = new Table()
      cache.set(args.uniqueKey, instance)
    }
  } else {
    instance = new Table()
  }
  return instance.render(args)
}

export default args => table(args)
