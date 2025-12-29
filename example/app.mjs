import halfcab, { html, css, state, rerender } from 'halfcab'
import * as sf from 'stalefish'

// Simple styles for cards and layout
const styles = css`
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
  .card { padding: 12px; border: 1px solid #8884; border-radius: 8px; background: #efefef; }
  .title { margin: 0 0 8px; font-size: 16px; font-weight: 600; }
  .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .subtle { font-size: 12px; opacity: 0.7; },
  .textfieldSelectBox { width: 260px }
  .variantSelectFull { width: 100%; }
`

// Demo form state
state.demo = state.demo || {
  text: '',
  textType: 'string',
  notes: '',
  agree: false,
  select: '',
  dropdown: '',
  date: '',
  dateDMY: '',
  datePretty: '',
  time: '',
  // Pre-populated demo fields
  timePre: '12:15',
  datePre: '2025-12-28',
  dateTime: '',
  // Uploader demo state
  fileImage: '',
  fileVideo: '',
  filePdf: '',
  file: ''
}

// helper available if needed during local tweaks
// import { formField } from 'halfcab'
// const bind = (prop) => formField(state.demo, prop)

const Showcase = () => html`
  <section>
    <div class="${styles.grid}">
      <div class="${styles.card}">
        <div class="${styles.title}">Text field</div>
        <div class="${styles.row}">
          <div style="width: 100%;">
            ${sf.selectbox({
    holdingPen: state.demo,
    property: 'textType',
    label: 'Variant',
    wrapperStyle: styles.variantSelectFull,
    options: [
      { name: 'string', value: 'string' },
      { name: 'number', value: 'number' },
      { name: 'integer', value: 'integer' },
      { name: 'color', value: 'color' }
    ],
    onchange: (e) => {
      const newType = e && e.currentTarget ? e.currentTarget.value : 'string'
      state.demo.textType = newType
      // Coerce current value to something sensible when switching types
      const val = state.demo.text
      if (newType === 'color') {
        const isHex = typeof val === 'string' && /^#?[0-9a-fA-F]{6}$/.test(val)
        state.demo.text = isHex ? (val.startsWith('#') ? val : `#${val}`) : '#000000'
      } else if (newType === 'number' || newType === 'integer') {
        const n = Number(val)
        state.demo.text = Number.isFinite(n) ? (newType === 'integer' ? String(Math.trunc(n)) : String(n)) : ''
      } else {
        // string
        state.demo.text = typeof val === 'string' ? val : String(val || '')
      }
      rerender()
    }
  })}
          </div>
        </div>
        ${sf.textfield({
          holdingPen: state.demo,
          property: 'text',
          label: 'Value',
          placeholder: state.demo.textType === 'color' ? '#rrggbb' : (state.demo.textType === 'number' || state.demo.textType === 'integer' ? 'enter a number' : 'e.g. Ada Lovelace'),
          type: state.demo.textType,
          valueContext: 'longer',
          wrapperStyle: styles.textfieldSelectBox
        })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Textarea</div>
        ${sf.textarea({
    holdingPen: state.demo,
    property: 'notes',
    label: 'Notes',
    placeholder: 'Write some notes'
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Checkbox</div>
        ${sf.checkbox({
    holdingPen: state.demo,
    property: 'agree',
    label: 'I agree to the terms'
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Selectbox</div>
        ${sf.selectbox({
    holdingPen: state.demo,
    property: 'select',
    label: 'Select option',
    options: [
      { name: 'Please choose…', value: '' },
      { name: 'Option A', value: 'A' },
      { name: 'Option B', value: 'B' },
      { name: 'Option C', value: 'C' }
    ]
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Dropdown</div>
        ${sf.dropdown({
    holdingPen: state.demo,
    property: 'dropdown',
    label: 'Dropdown',
    options: [
      { name: 'Alpha', value: 'alpha' },
      { name: 'Beta', value: 'beta' },
      { name: 'Gamma', value: 'gamma' }
    ]
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Date picker</div>
        ${sf.datePicker({
    holdingPen: state.demo,
    property: 'date',
    label: 'Date'
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Date picker (pre-populated)</div>
        ${sf.datePicker({
    holdingPen: state.demo,
    property: 'datePre',
    label: 'Date (starts with today)'
  })}
        <div class="${styles.subtle}">Initial value set to 2025-12-28 for testing.</div>
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Date picker (format variations)</div>
        <div class="${styles.row}">
          ${sf.datePicker({
    holdingPen: state.demo,
    property: 'dateDMY',
    label: 'Date (DD/MM/YYYY)',
    format: 'DD/MM/YYYY'
  })}
          ${sf.datePicker({
    holdingPen: state.demo,
    property: 'datePretty',
    label: 'Date (MMM D, YYYY)',
    format: 'MMM D, YYYY'
  })}
        </div>
        <div class="${styles.subtle}">Both fields store values as YYYY-MM-DD in state; formats affect display only.</div>
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Time picker</div>
        ${sf.timePicker({
    holdingPen: state.demo,
    property: 'time',
    label: 'Time',
    minuteStep: 15
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Time picker (pre-populated 12:15)</div>
        ${sf.timePicker({
    holdingPen: state.demo,
    property: 'timePre',
    label: 'Time (starts at 12:15)',
    minuteStep: 15
  })}
        <div class="${styles.subtle}">Use the arrows to verify the first step respects the pre-loaded value.</div>
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Uploader</div>
        ${sf.uploader({
    holdingPen: state.demo,
    property: 'fileImage',
    label: 'Upload image',
    placeholder: 'Choose/drop an image',
    accept: '.jpg, .jpeg, .gif, .bmp, .tif, .tiff, .png, .svg',
    onchange: (e) => {
      const files = (e && e.files) || (e && e.target && (e.target.files || e.target._droppedFiles))
      const f = files && files[0]
      state.demo.fileImage = f ? f.name : ''
      rerender()
    },
    onclear: () => { state.demo.fileImage = ''; rerender() }
  })}

        ${sf.uploader({
    holdingPen: state.demo,
    property: 'fileVideo',
    label: 'Upload video',
    placeholder: 'Choose/drop a video',
    accept: '.mxf, .mkv, .webm, .mov, .wmv, .mp4, .3gp, .avi, .mpg, .mpeg, .flv, .asx, .asf, .divx, .rm, .m1v, .m2v, .m4v',
    onchange: (e) => {
      const files = (e && e.files) || (e && e.target && (e.target.files || e.target._droppedFiles))
      const f = files && files[0]
      state.demo.fileVideo = f ? f.name : ''
      rerender()
    },
    onclear: () => { state.demo.fileVideo = ''; rerender() }
  })}

        ${sf.uploader({
    holdingPen: state.demo,
    property: 'filePdf',
    label: 'Upload PDF',
    placeholder: 'Choose/drop a PDF',
    accept: '.pdf',
    onchange: (e) => {
      const files = (e && e.files) || (e && e.target && (e.target.files || e.target._droppedFiles))
      const f = files && files[0]
      state.demo.filePdf = f ? f.name : ''
      rerender()
    },
    onclear: () => { state.demo.filePdf = ''; rerender() }
  })}

        ${sf.uploader({
    holdingPen: state.demo,
    property: 'file',
    label: 'Upload any file',
    placeholder: 'Choose/drop a file',
    onchange: (e) => {
      const files = (e && e.files) || (e && e.target && (e.target.files || e.target._droppedFiles))
      const f = files && files[0]
      state.demo.file = f ? f.name : ''
      rerender()
    },
    onclear: () => { state.demo.file = ''; rerender() }
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Buttons</div>
        <div class="${styles.row}">
          ${sf.button({ label: 'Primary', onclick: () => console.log('Primary clicked') })}
          ${sf.button({ label: 'Secondary', style: 'secondary' })}
        </div>
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Panel</div>
        ${sf.panel({ title: 'Panel title', content: html`<p>Panel body content</p>` })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Table</div>
        ${sf.table({
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'qty', label: 'Qty' }
    ],
    rows: [
      { name: 'Apples', qty: 3 },
      { name: 'Oranges', qty: 5 }
    ]
  })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Loader</div>
        ${sf.loader({})}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Toolbar + FAB</div>
        ${sf.toolbar({ left: html`<strong>Title</strong>`, right: html`${sf.button({ label: 'Action' })}` })}
        <div style="height: 40px"></div>
        ${sf.fab({ label: '+', onclick: () => console.log('FAB clicked') })}
      </div>

      <div class="${styles.card}">
        <div class="${styles.title}">Side Drawer</div>
        ${sf.sideDrawer({ open: false, content: html`<div style="padding:12px;">Drawer content</div>` })}
      </div>
    </div>

    <div class="${styles.card}" style="margin-top:16px;">
      <div class="${styles.title}">Form state</div>
      <pre><code>${JSON.stringify(state.demo, null, 2)}</code></pre>
    </div>
  </section>
`

const App = () => Showcase()

halfcab({ el: '#app', components: App }).catch((err) => {
  console.error('Failed to start stalefish demo:', err)
})
