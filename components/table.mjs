import { html, css } from 'halfcab'

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
    background-color: #FDFDFD;}
  }
`

let _columns = [{
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

export default ({columns = _columns, data = _data} = {}) => html`
   <table class="${styles.table}">
    <thead class="${styles.thRow}">
        <tr>
            ${columns.map(column => html`<th class="${styles.th} ${column.style || ''}" scope="col" ${column.action ? {onclick: column.action} : ''}>${column.title}${column.icon ? column.icon : ''}</th>`)}
        </tr>
    </thead>
    <tbody>
       ${data.map(row => html`<tr class="${styles.tr}">${row.map(column => html`<td ${column.style ? {'class': column.style} : ''} style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap; max-width: 0; direction: rtl;">${typeof column.content === 'function' ? column.content() : column.content}</td>`)}</tr>`)}
    </tbody>
</table>
`
