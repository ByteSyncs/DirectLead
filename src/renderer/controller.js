const defaults = {
  whatsappOpenWith: 'web',
  myBusiness: 'ByteSyncs',
  whatsappTemplate:
    'Hola {business_name}, soy de {my_business}. Vi su negocio y quería contactarlos para conversar sobre una posible mejora de su presencia en línea. ¿Con quién podría hablar?',
  emailSubject: 'Una idea para {business_name}',
  emailFrom: '',
  emailBody:
    'Hola {business_name},\nSoy de {my_business}. Vi su negocio y quería contactarlos para conversar sobre una posible mejora de su presencia en línea.\nQuedo atento.\n{my_business}',
  shortcuts: {
    newProspect: { key: 'n', ctrl: false, alt: false, shift: false },
    openPalette: { key: 'k', ctrl: true, alt: false, shift: false },
    closeActive: { key: 'Escape', ctrl: false, alt: false, shift: false },
    palettePrevious: { key: 'ArrowUp', ctrl: false, alt: false, shift: false },
    paletteNext: { key: 'ArrowDown', ctrl: false, alt: false, shift: false },
    paletteSelect: { key: 'Enter', ctrl: false, alt: false, shift: false },
    resizeNarrower: { key: 'ArrowLeft', ctrl: false, alt: false, shift: false },
    resizeWider: { key: 'ArrowRight', ctrl: false, alt: false, shift: false },
    toggleFullscreen: { key: 'F11', ctrl: false, alt: false, shift: false }
  }
}

const TERMS_ACCEPTANCE_KEY = 'directlead-accepted-terms-version'
const TERMS_VERSION = '2026-09-29'

const SHORTCUTS = [
  { id: 'newProspect', title: 'Nuevo prospecto', description: 'Abre el formulario para crear un prospecto.', group: 'Acciones' },
  { id: 'openPalette', title: 'Búsqueda rápida', description: 'Busca acciones y prospectos.', group: 'Acciones' },
  { id: 'closeActive', title: 'Cerrar o volver', description: 'Cierra el diálogo activo o vuelve desde Configuración.', group: 'Navegación' },
  { id: 'palettePrevious', title: 'Resultado anterior', description: 'Sube una opción en la búsqueda rápida.', group: 'Búsqueda rápida' },
  { id: 'paletteNext', title: 'Resultado siguiente', description: 'Baja una opción en la búsqueda rápida.', group: 'Búsqueda rápida' },
  { id: 'paletteSelect', title: 'Abrir resultado', description: 'Ejecuta la opción seleccionada.', group: 'Búsqueda rápida' },
  { id: 'resizeNarrower', title: 'Reducir lista', description: 'Estrecha la columna de prospectos cuando el separador está enfocado.', group: 'Panel de lista' },
  { id: 'resizeWider', title: 'Ampliar lista', description: 'Ensacha la columna de prospectos cuando el separador está enfocado.', group: 'Panel de lista' },
  { id: 'toggleFullscreen', title: 'Alternar pantalla completa', description: 'Entra o sale de pantalla completa.', group: 'Ventana' }
]

function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem('directlead-settings') || '{}')
    const settings = { ...defaults, ...savedSettings }
    settings.shortcuts = Object.fromEntries(Object.entries(defaults.shortcuts).map(([id, binding]) => [
      id,
      { ...binding, ...(savedSettings.shortcuts?.[id] || {}) }
    ]))
    return settings
  } catch {
    return { ...defaults }
  }
}

const state = {
  view: 'prospects', prospects: [], selectedId: null, editingId: null,
  search: '', selectedSettingId: 'messages', messageChannel: 'whatsapp',
  mobile: window.matchMedia('(max-width: 800px)').matches,
  mobileScreen: 'list', paletteIndex: 0, shortcutCapture: null,
  legalRequestId: 0,
  update: {
    status: 'idle', currentVersion: '', version: null,
    releaseNotes: '', percent: 0, error: null
  },
  termsGateActive: localStorage.getItem(TERMS_ACCEPTANCE_KEY) !== TERMS_VERSION,
  settings: loadSettings()
}

const variables = [
  ['business_name', 'Nombre del negocio'], ['phone', 'Teléfono del prospecto'],
  ['email', 'Email del prospecto'], ['url', 'Link del prospecto'],
  ['my_business', 'Tu negocio']
]

const $ = (selector) => {
  const element = document.querySelector(selector)
  if (!element) throw new Error(`No se encontró el elemento ${selector}`)
  return element
}

const elements = {
  app: $('#app-root'), railProspects: $('#rail-prospects'), railUpdates: $('#rail-updates'),
  updateBadge: $('#update-badge'), railSettings: $('#rail-settings'),
  listPane: $('#list-pane'), viewProspects: $('#view-prospects'), viewSettings: $('#view-settings'),
  prospectList: $('#prospect-list'), emptyList: $('#empty-list'),
  prospectCount: $('#prospect-count'), listStatus: $('#list-status'), search: $('#search-input'),
  newButton: $('#new-prospect-button'), settingsList: $('#settings-list'),
  detailPanel: $('#detail-panel'), detailEmpty: $('#detail-empty'), detail: $('#prospect-detail'),
  settingsDetail: $('#settings-detail'), detailName: $('#detail-business-name'),
  detailPhone: $('#detail-phone'), detailEmail: $('#detail-email'), detailUrl: $('#detail-url'),
  detailMessage: $('#detail-message'), detailNotes: $('#detail-notes'),
  infoCreated: $('#info-created'), infoContacted: $('#info-contacted'),
  whatsapp: $('#whatsapp-button'), email: $('#email-button'), edit: $('#edit-button'),
  delete: $('#delete-button'), openUrl: $('#open-url-button'),
  pagePrev: $('#page-prev'), pageNext: $('#page-next'), pageCounter: $('#page-counter'),
  mobileBack: $('#mobile-back'), resizeHandle: $('#resize-handle'),
  modal: $('#modal-backdrop'), modalLabel: $('#modal-label'), modalTitle: $('#modal-title'),
  modalClose: $('#modal-close'), modalCancel: $('#modal-cancel'), form: $('#prospect-form'),
  formId: $('#form-id'), formName: $('#form-business-name'), formPhone: $('#form-phone'),
  formEmail: $('#form-email'), formContacted: $('#form-contacted-at'), formUrl: $('#form-url'),
  formMessage: $('#form-message'), formNotes: $('#form-notes'), modalActions: $('#modal-actions'),
  modalWhatsapp: $('#modal-whatsapp-button'), modalEmail: $('#modal-email-button'),
  submitLabel: $('#submit-label'), paletteTrigger: $('#palette-trigger'),
  palette: $('#palette-backdrop'), paletteInput: $('#palette-input'),
  paletteResults: $('#palette-results'), legalModal: $('#legal-backdrop'),
  legalTitle: $('#legal-title'), legalClose: $('#legal-close'),
  legalContent: $('#legal-content'), legalFooterClose: $('#legal-footer-close'),
  termsFooter: $('#terms-footer'), termsConsent: $('#terms-consent'),
  termsCheckbox: $('#terms-checkbox'), termsPrivacy: $('#terms-privacy'),
  termsReturn: $('#terms-return'), termsReject: $('#terms-reject'),
  termsAccept: $('#terms-accept'), toast: $('#toast')
}

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function setVisible(element, visible, displayClass = '') {
  element.hidden = !visible
  element.classList.toggle('hidden', !visible)
  if (visible && displayClass) element.classList.add(displayClass)
}

function showToast(message) {
  elements.toast.textContent = message
  elements.toast.classList.remove('translate-y-2', 'opacity-0')
  elements.toast.classList.add('translate-y-0', 'opacity-100')
  clearTimeout(showToast.timeout)
  showToast.timeout = setTimeout(() => {
    elements.toast.classList.add('translate-y-2', 'opacity-0')
    elements.toast.classList.remove('translate-y-0', 'opacity-100')
  }, 2800)
}

function saveSettings() {
  localStorage.setItem('directlead-settings', JSON.stringify(state.settings))
}

function selectedProspect() {
  return state.prospects.find((prospect) => prospect.id === state.selectedId) || null
}

function filteredProspects() {
  const term = state.search.trim().toLocaleLowerCase()
  if (!term) return state.prospects
  return state.prospects.filter((prospect) =>
    [prospect.business_name, prospect.phone, prospect.email, prospect.url, prospect.message, prospect.notes]
      .join(' ').toLocaleLowerCase().includes(term)
  )
}

function formatDate(value, includeTime = false) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' } : {})
  }).format(date)
}

function toLocalDateTime(value) {
  const date = value ? new Date(value) : new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

async function loadProspects() {
  try {
    state.prospects = await window.api.getProspects()
    if (!state.prospects.some((prospect) => prospect.id === state.selectedId)) {
      state.selectedId = state.prospects[0]?.id ?? null
    }
    render()
  } catch (error) {
    console.error(error)
    showToast('No se pudieron cargar los prospectos.')
  }
}

function renderList() {
  const prospects = filteredProspects()
  elements.prospectCount.textContent = `${prospects.length} ${prospects.length === 1 ? 'prospecto' : 'prospectos'}`
  elements.listStatus.textContent = state.search ? 'Resultados' : 'Todos'
  elements.prospectList.innerHTML = prospects.map((prospect) => `
    <button type="button" data-prospect-id="${prospect.id}" aria-current="${prospect.id === state.selectedId}"
      class="group w-full border-b border-line-soft px-4 py-4 text-left transition ${prospect.id === state.selectedId ? 'bg-paper-light' : 'hover:bg-paper-light/70'}">
      <div class="flex items-start justify-between gap-3"><div class="min-w-0">
        <p class="truncate text-[13px] font-medium text-text">${escapeHtml(prospect.business_name || 'Sin nombre')}</p>
        <p class="mt-1 truncate text-[11px] text-text-soft">${escapeHtml(prospect.phone || 'Sin teléfono')}</p>
        ${prospect.email ? `<p class="mt-1 truncate text-[11px] text-text-muted">${escapeHtml(prospect.email)}</p>` : ''}
      </div><span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${prospect.id === state.selectedId ? 'bg-accent' : 'bg-line'}"></span></div>
    </button>`).join('')
  setVisible(elements.prospectList, prospects.length > 0)
  setVisible(elements.emptyList, prospects.length === 0, 'flex')
  elements.emptyList.querySelector('p').textContent = state.search ? 'Sin resultados' : 'No hay prospectos'
  elements.emptyList.querySelector('span:last-child').textContent = state.search
    ? 'Probá con otro término de búsqueda.' : 'Agregá uno para comenzar.'
}

function renderDetail() {
  const prospect = selectedProspect()
  setVisible(elements.detailEmpty, !prospect, 'flex')
  setVisible(elements.detail, Boolean(prospect))
  if (!prospect) return
  elements.detailName.textContent = prospect.business_name || 'Sin nombre'
  elements.detailPhone.textContent = prospect.phone || 'Sin teléfono'
  elements.detailEmail.textContent = prospect.email || 'Sin email'
  elements.detailUrl.textContent = prospect.url || ''
  elements.detailMessage.textContent = renderTemplate(
    prospect.message || state.settings.whatsappTemplate,
    prospect
  )
  elements.detailNotes.textContent = prospect.notes || ''
  elements.infoCreated.textContent = formatDate(prospect.created_at)
  elements.infoContacted.textContent = formatDate(prospect.contacted_at, true)
  elements.email.disabled = !prospect.email
  elements.whatsapp.disabled = !prospect.phone
  const index = state.prospects.findIndex((item) => item.id === prospect.id)
  elements.pageCounter.textContent = `Hoja ${index + 1} de ${state.prospects.length}`
  elements.pagePrev.disabled = index <= 0
  elements.pageNext.disabled = index < 0 || index >= state.prospects.length - 1
  elements.openUrl.disabled = !prospect.url
}

function renderRail() {
  const settings = state.view === 'settings'
  const updates = settings && state.selectedSettingId === 'updates'
  const configuration = settings && !updates
  const updateAvailable = ['available', 'downloading', 'downloaded'].includes(state.update.status)
  for (const [button, active] of [[elements.railProspects, !settings], [elements.railSettings, configuration]]) {
    button.classList.toggle('bg-paper-light', active)
    button.classList.toggle('text-accent', active)
    button.classList.toggle('text-text-muted', !active)
    button.querySelector('[data-rail-marker]').classList.toggle('hidden', !active)
  }
  elements.railUpdates.classList.toggle('bg-paper-light', updates)
  elements.railUpdates.classList.toggle('text-[#f0c75e]', updateAvailable)
  elements.railUpdates.classList.toggle('text-accent', updates && !updateAvailable)
  elements.railUpdates.classList.toggle('text-text-muted', !updates && !updateAvailable)
  elements.railUpdates.querySelector('[data-rail-marker]').classList.toggle('hidden', !updates)
  elements.updateBadge.hidden = !updateAvailable
}

function renderSettingsList() {
  const sections = [
    ['messages', 'Configuración de Mensajes', 'Plantillas y canales'],
    ['shortcuts', 'Atajos', 'Personaliza el teclado'],
    ['updates', 'Actualizaciones', updateSettingsSubtitle()],
    ['help', 'Ayuda', 'Respuestas de uso'],
    ['about', 'Acerca de', 'Información de la aplicación'],
  ]
  elements.settingsList.innerHTML = sections.map(([id, title, subtitle]) => `
    <button type="button" data-setting-id="${id}" class="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition ${id === state.selectedSettingId ? 'bg-paper-light text-text' : 'text-text-soft hover:bg-paper-light/70'}">
      <span><span class="block text-[12px]">${title}</span><span class="mt-1 block text-[10px] text-text-muted">${subtitle}</span></span><span class="text-text-muted" aria-hidden="true">›</span>
    </button>`).join('')
}

function updateSettingsSubtitle() {
  if (state.update.status === 'available') return `Nueva versión ${state.update.version}`
  if (state.update.status === 'downloaded') return 'Actualización lista para instalar'
  if (state.update.status === 'checking') return 'Buscando actualizaciones...'
  if (state.update.status === 'up-to-date') return 'Estás al día'
  if (state.update.status === 'development') return 'Consulta disponible en la app instalada'
  return 'Versión y notas de lanzamiento'
}

function renderUpdates() {
  const update = state.update
  const headings = {
    idle: 'Comprobar actualizaciones',
    checking: 'Buscando una nueva versión...',
    'up-to-date': 'DirectLead está actualizado',
    available: `DirectLead ${update.version} está disponible`,
    downloading: 'Descargando actualización',
    downloaded: `DirectLead ${update.version} está lista para instalar`,
    error: 'No se pudo comprobar si hay actualizaciones',
    development: 'Actualizaciones disponibles en la app instalada'
  }
  const descriptions = {
    idle: `Versión instalada: ${update.currentVersion || 'desconocida'}. Puedes buscar una versión nueva.`,
    checking: 'Consultando los releases oficiales de DirectLead en GitHub.',
    'up-to-date': `Tienes instalada la versión ${update.currentVersion}.`,
    available: `Tu versión es ${update.currentVersion}. La nueva versión ${update.version} incluye las notas que aparecen abajo.`,
    downloading: `Descargando la versión ${update.version}. No cierres la aplicación.`,
    downloaded: `La versión ${update.version} ya se descargó. Reinicia DirectLead para completar la actualización.`,
    error: update.error || 'Comprueba tu conexión e inténtalo de nuevo.',
    development: 'Las actualizaciones se consultan desde el instalador publicado; este control solo funciona en una versión instalada.'
  }
  const available = update.status === 'available'
  const downloading = update.status === 'downloading'
  const downloaded = update.status === 'downloaded'
  const upToDate = update.status === 'up-to-date'
  const notes = update.releaseNotes?.trim()

  elements.settingsDetail.innerHTML = `
    <div class="w-full max-w-[900px]">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">DIRECTLEAD</p>
      <h2 class="mt-2 font-serif text-[26px] text-text">Actualizaciones</h2>
      <section class="mt-7 border-y border-line py-6" aria-live="polite">
        <p class="text-[10px] font-semibold uppercase tracking-[0.12em] ${available || downloaded ? 'text-[#f0c75e]' : 'text-text-muted'}">${update.status === 'available' ? 'NUEVA VERSIÓN' : update.status === 'downloaded' ? 'LISTA PARA INSTALAR' : 'ESTADO'}</p>
        <h3 class="mt-2 text-[15px] font-medium text-text">${escapeHtml(headings[update.status] || headings.idle)}</h3>
        <p class="mt-2 text-[12px] leading-6 text-text-soft">${escapeHtml(descriptions[update.status] || descriptions.idle)}</p>
        ${downloading ? `
          <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-paper-light" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(update.percent)}">
            <div class="h-full bg-accent transition-[width]" style="width: ${Math.max(0, Math.min(100, update.percent))}%"></div>
          </div>
          <p class="mt-2 text-[10px] text-text-muted">${Math.round(update.percent)}%</p>` : ''}
        <div class="mt-5 flex flex-wrap gap-2">
          ${available ? '<button type="button" data-update-action="download" class="min-h-[36px] rounded-[7px] border border-accent bg-accent px-4 text-[11px] font-semibold text-[#171812] transition hover:bg-[#c8d5af]">Descargar actualización</button>' : ''}
          ${downloaded ? '<button type="button" data-update-action="install" class="min-h-[36px] rounded-[7px] border border-accent bg-accent px-4 text-[11px] font-semibold text-[#171812] transition hover:bg-[#c8d5af]">Reiniciar e instalar</button>' : ''}
          ${!downloading && !downloaded && update.status !== 'development' ? `<button type="button" data-update-action="check" ${update.status === 'checking' ? 'disabled' : ''} class="min-h-[36px] rounded-[7px] border border-line px-4 text-[11px] text-text-soft transition hover:border-[#42423a] hover:bg-paper-light hover:text-text disabled:opacity-40">Buscar actualizaciones</button>` : ''}
        </div>
      </section>
      ${available || downloaded || (upToDate && notes) ? `
        <section class="mt-7">
          <h3 class="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">${upToDate ? 'RELEASE INSTALADO' : 'NOVEDADES DE LA VERSIÓN'} ${escapeHtml(update.version || '')}</h3>
          <pre class="mt-3 whitespace-pre-wrap font-sans text-[12px] leading-6 text-text-soft">${escapeHtml(notes || 'Este release no incluye notas adicionales.')}</pre>
        </section>` : ''}
      ${update.status === 'error' ? '<p class="mt-5 text-[10px] leading-5 text-text-muted">La consulta de actualizaciones solo contacta GitHub para buscar releases. Tus prospectos no se envían.</p>' : ''}
    </div>`
}

async function runUpdateAction(action) {
  try {
    if (action === 'check') state.update = await window.api.checkForUpdates()
    if (action === 'download') state.update = await window.api.downloadUpdate()
    if (action === 'install') {
      await window.api.installUpdate()
      return
    }
    renderRail()
    renderSettingsList()
    if (state.view === 'settings' && state.selectedSettingId === 'updates') renderUpdates()
  } catch (error) {
    console.error(error)
    state.update = { ...state.update, status: 'error', error: 'No se pudo completar la acción. Inténtalo otra vez.' }
    renderRail()
    if (state.view === 'settings' && state.selectedSettingId === 'updates') renderUpdates()
  }
}

function variableButtons() {
  return variables.map(([key, label]) => `<button type="button" data-variable="${key}" title="${label}" class="rounded-md border border-line bg-paper px-2.5 py-1.5 font-mono text-[11px] text-text-soft transition hover:border-accent hover:text-accent">{ ${key} }</button>`).join('')
}

function renderMessageSettings() {
  const whatsapp = state.messageChannel === 'whatsapp'
  const settings = state.settings

  elements.settingsDetail.innerHTML = `
    <div class="w-full"><section class="w-full min-h-[620px]">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">AJUSTES</p>
      <h2 class="mt-2 font-serif text-[26px] text-text">Configuración de Mensajes</h2>
      <label class="mt-7 block text-[10px] uppercase tracking-[0.12em] text-text-muted">Mi negocio
        <input id="settings-business" value="${escapeHtml(settings.myBusiness)}" class="mt-2 h-10 w-full rounded-md border border-line bg-paper px-3 text-[12px] text-text outline-none focus:border-accent" />
      </label>
      <div class="mt-6 flex gap-1 border-b border-line">
        <button type="button" data-channel="whatsapp" class="border-b-2 px-4 py-2 text-[11px] ${whatsapp ? 'border-accent text-text' : 'border-transparent text-text-muted'}">WhatsApp</button>
        <button type="button" data-channel="email" class="border-b-2 px-4 py-2 text-[11px] ${!whatsapp ? 'border-accent text-text' : 'border-transparent text-text-muted'}">Email</button>
      </div>
      ${whatsapp ? `
        <label class="mt-6 block text-[10px] uppercase tracking-[0.12em] text-text-muted">Plantilla de WhatsApp
          <textarea id="settings-whatsapp-template" rows="7" class="ruled mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-[12px] leading-8 text-text outline-none focus:border-accent">${escapeHtml(settings.whatsappTemplate)}</textarea>
        </label>
        <div class="mt-4 flex flex-wrap gap-2">${variableButtons()}</div>
        <div class="mt-6 space-y-5">
          <label class="text-[10px] uppercase tracking-[0.12em] text-text-muted">Abrir WhatsApp con
            <select id="settings-whatsapp-open" class="mt-2 h-10 w-full rounded-md border border-line bg-paper px-3 text-[12px] text-text [color-scheme:dark]">
              <option value="web" ${settings.whatsappOpenWith === 'web' ? 'selected' : ''}>WhatsApp Web</option>
              <option value="desktop" ${settings.whatsappOpenWith === 'desktop' ? 'selected' : ''}>WhatsApp Desktop</option>
            </select>
          </label>
        </div>` : `
        <label class="mt-6 block text-[10px] uppercase tracking-[0.12em] text-text-muted">Asunto predeterminado
          <input id="settings-email-subject" value="${escapeHtml(settings.emailSubject)}" class="mt-2 h-10 w-full rounded-md border border-line bg-paper px-3 text-[12px] text-text outline-none focus:border-accent" />
        </label>
        <label class="mt-5 block text-[10px] uppercase tracking-[0.12em] text-text-muted">Email de origen / remitente
          <input id="settings-email-from" type="email" value="${escapeHtml(settings.emailFrom)}" class="mt-2 h-10 w-full rounded-md border border-line bg-paper px-3 text-[12px] text-text outline-none focus:border-accent" />
          <span class="mt-2 block normal-case tracking-normal text-text-muted">El cliente de correo decide desde qué cuenta enviar.</span>
        </label>
        <label class="mt-5 block text-[10px] uppercase tracking-[0.12em] text-text-muted">Cuerpo del email
          <textarea id="settings-email-body" rows="8" class="ruled mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-[12px] leading-8 text-text outline-none focus:border-accent">${escapeHtml(settings.emailBody)}</textarea>
        </label><div class="mt-4 flex flex-wrap gap-2">${variableButtons()}</div>`}
    </section></div>`
}

function renderAbout() {
  elements.settingsDetail.innerHTML = `
    <div class="w-full max-w-[900px]">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">DIRECTLEAD · BYTESYNCS</p>
      <h2 class="mt-2 font-serif text-[26px] text-text">Acerca de DirectLead</h2>
      <p class="mt-2 max-w-[680px] text-[13px] leading-6 text-text-soft">Una aplicación de escritorio para organizar prospectos, conservar su información y preparar mensajes de contacto desde un solo lugar.</p>

      <section class="mt-8 border-y border-line" aria-label="Información de DirectLead">
        <div class="grid gap-x-10 sm:grid-cols-2">
          <div class="border-b border-line py-4">
            <p class="text-[10px] uppercase tracking-[0.12em] text-text-muted">Versión</p>
            <p class="mt-1 text-[12px] text-text">${escapeHtml(state.update.currentVersion || 'Desconocida')}</p>
          </div>
          <div class="border-b border-line py-4">
            <p class="text-[10px] uppercase tracking-[0.12em] text-text-muted">Plataforma</p>
            <p class="mt-1 text-[12px] text-text">Aplicación de escritorio con Electron</p>
          </div>
          <div class="border-b border-line py-4">
            <p class="text-[10px] uppercase tracking-[0.12em] text-text-muted">Prospectos</p>
            <p class="mt-1 text-[12px] text-text">Base de datos SQLite local</p>
          </div>
          <div class="py-4">
            <p class="text-[10px] uppercase tracking-[0.12em] text-text-muted">Preferencias</p>
            <p class="mt-1 text-[12px] text-text">Guardadas en este dispositivo</p>
          </div>
        </div>
        <p class="border-t border-line py-4 text-[11px] leading-5 text-text-muted">Los datos no se sincronizan con la nube. Las preferencias de mensajes se almacenan localmente en la aplicación.</p>
      </section>

      <section class="mt-9" aria-label="ByteSyncs">
        <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">QUIÉN LA CONSTRUYE</p>
        <h3 class="mt-2 font-serif text-[21px] text-text">ByteSyncs</h3>
        <p class="mt-2 max-w-[700px] text-[13px] leading-6 text-text-soft">Diseñamos software y experiencias web alrededor de cómo funciona cada negocio. Construimos una vez; trabajamos para que los productos puedan mantenerse, evolucionar y acompañar su crecimiento.</p>

        <div class="mt-5 grid gap-x-10 border-y border-line sm:grid-cols-2">
          <p class="border-b border-line py-3 text-[12px] text-text-soft">Desarrollo web y experiencias digitales</p>
          <p class="border-b border-line py-3 text-[12px] text-text-soft">Aplicaciones y productos a medida</p>
          <p class="border-b border-line py-3 text-[12px] text-text-soft">Consultoría y arquitectura técnica</p>
          <p class="py-3 text-[12px] text-text-soft">Mantenimiento, soporte y evolución</p>
        </div>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-[12px]">
          <a href="https://bytesyncs.com" data-external-url class="text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">bytesyncs.com</a>
          <a href="mailto:info@bytesyncs.com" data-external-url class="text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent">info@bytesyncs.com</a>
          <a href="https://linkedin.com/company/wearebytesyncs" data-external-url class="text-text-soft underline decoration-line underline-offset-4 transition hover:text-text">LinkedIn</a>
          <a href="https://github.com/bytesyncs" data-external-url class="text-text-soft underline decoration-line underline-offset-4 transition hover:text-text">GitHub</a>
        </div>
      </section>

      <section class="mt-9 border-t border-line pt-5" aria-label="Información legal">
        <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">DOCUMENTOS DE DIRECTLEAD</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" data-legal-open="privacy" class="rounded-md border border-line px-3 py-2 text-[11px] text-text-soft transition hover:border-accent hover:text-accent">Privacidad</button>
          <button type="button" data-legal-open="terms" class="rounded-md border border-line px-3 py-2 text-[11px] text-text-soft transition hover:border-accent hover:text-accent">Términos de uso</button>
        </div>
        <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">DOCUMENTOS DEL SITIO BYTESYNCS</p>
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-[12px]">
          <a href="https://bytesyncs.com/privacy" data-external-url class="text-text-soft underline decoration-line underline-offset-4 transition hover:text-text">Privacidad del sitio ByteSyncs</a>
          <a href="https://bytesyncs.com/terms" data-external-url class="text-text-soft underline decoration-line underline-offset-4 transition hover:text-text">Términos del sitio ByteSyncs</a>
        </div>
      </section>
    </div>`
}

function formatShortcut(binding) {
  if (!binding) return ''
  const keyLabels = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Escape: 'Esc', Enter: 'Enter', ' ': 'Space', Tab: 'Tab'
  }
  return [
    ...(binding.ctrl ? ['Ctrl'] : []),
    ...(binding.alt ? ['Alt'] : []),
    ...(binding.shift ? ['Shift'] : []),
    keyLabels[binding.key] || (binding.key.length === 1 ? binding.key.toUpperCase() : binding.key)
  ].join(' + ')
}

function shortcutMatches(event, id) {
  const binding = state.settings.shortcuts[id]
  return Boolean(binding)
    && event.key.toLowerCase() === binding.key.toLowerCase()
    && (event.ctrlKey || event.metaKey) === binding.ctrl
    && event.altKey === binding.alt
    && event.shiftKey === binding.shift
}

function shortcutFromEvent(event) {
  return {
    key: event.key,
    ctrl: event.ctrlKey || event.metaKey,
    alt: event.altKey,
    shift: event.shiftKey
  }
}

function shortcutsEqual(first, second) {
  return first.key.toLowerCase() === second.key.toLowerCase()
    && first.ctrl === second.ctrl
    && first.alt === second.alt
    && first.shift === second.shift
}

function renderShortcuts() {
  const groups = [...new Set(SHORTCUTS.map((shortcut) => shortcut.group))]
  elements.settingsDetail.innerHTML = `
    <div class="w-full max-w-[900px]">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">PREFERENCIAS</p>
      <h2 class="mt-2 font-serif text-[26px] text-text">Atajos de teclado</h2>
      <p class="mt-2 max-w-[680px] text-[12px] leading-6 text-text-soft">Selecciona una combinación para cambiarla. Las asignaciones se guardan en este dispositivo; cada combinación debe ser única.</p>
      <button type="button" data-shortcuts-reset class="mt-5 rounded-md border border-line px-3 py-2 text-[11px] text-text-soft transition hover:border-[#414139] hover:bg-paper-light hover:text-text">Restaurar predeterminados</button>
      <div class="mt-8 space-y-8">
        ${groups.map((group) => `
          <section data-shortcut-group>
            <h3 class="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">${group}</h3>
            <div class="border-t border-line">
              ${SHORTCUTS.filter((shortcut) => shortcut.group === group).map((shortcut) => `
                <div class="flex items-center justify-between gap-4 border-b border-line py-3">
                  <div class="min-w-0">
                    <p class="text-[12px] text-text-soft">${shortcut.title}</p>
                    <p class="mt-1 text-[10px] leading-5 text-text-muted">${shortcut.description}</p>
                  </div>
                  <button type="button" data-shortcut-capture="${shortcut.id}" class="min-w-[96px] shrink-0 rounded-md border border-line bg-paper px-3 py-2 text-[11px] font-medium text-text transition hover:border-accent hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent/40">${escapeHtml(formatShortcut(state.settings.shortcuts[shortcut.id]))}</button>
                </div>`).join('')}
            </div>
          </section>`).join('')}
      </div>
    </div>`
}

function renderHelp() {
  const sections = [
    {
      title: 'Prospectos',
      items: [
        {
          question: '¿Cómo agrego un prospecto?',
          keywords: 'crear nuevo empresa teléfono email contacto fecha',
          answer: 'Pulsa el botón <strong>+</strong> junto al título Prospectos, completa Empresa, Teléfono, Contactado y Mensaje, y guarda. Email, link y notas son opcionales.'
        },
        {
          question: '¿Cómo edito o elimino un prospecto?',
          keywords: 'cambiar actualizar borrar editar notas mensaje teléfono',
          answer: 'Selecciona el prospecto y pulsa <strong>Editar</strong> para modificar todos sus datos. También puedes hacer clic en el nombre, teléfono, email, link, mensaje o notas de la ficha y guardar el cambio al salir del campo. <strong>Eliminar</strong> borra el registro después de pedir confirmación.'
        },
        {
          question: '¿Qué busca el buscador?',
          keywords: 'buscar filtrar empresa teléfono email url notas mensaje',
          answer: 'Busca coincidencias en el nombre de la empresa, teléfono, email, link, mensaje y notas. Pulsa <strong>Ctrl+K</strong> para abrir la búsqueda de acciones y prospectos.'
        },
        {
          question: '¿Qué hacen Hoja anterior y Hoja siguiente?',
          keywords: 'navegar siguiente anterior páginas prospectos',
          answer: 'Cambian al prospecto anterior o siguiente de la lista, respectivamente. No modifican ni eliminan datos.'
        }
      ]
    },
    {
      title: 'Contacto',
      items: [
        {
          question: '¿Cómo abro WhatsApp con un prospecto?',
          keywords: 'whatsapp teléfono contactar mensaje país codigo internacional',
          answer: 'Selecciona un prospecto y pulsa <strong>WhatsApp</strong>. DirectLead prepara el mensaje configurado y abre WhatsApp Web o Desktop según tu preferencia. Si no hay teléfono, completa ese dato primero.'
        },
        {
          question: '¿Cómo preparo la plantilla de WhatsApp o email?',
          keywords: 'plantilla variables negocio business_name email asunto cuerpo personalizar',
          answer: 'Abre Configuración de Mensajes y elige la pestaña WhatsApp o Email. Edita la plantilla y pulsa una variable para insertarla en el cursor, por ejemplo <code>{ business_name }</code> o <code>{ my_business }</code>. Los cambios se guardan automáticamente.'
        },
        {
          question: '¿Para qué sirve Email de origen / remitente?',
          keywords: 'email remitente from cuenta correo mailto enviar',
          answer: 'Ese valor queda guardado como referencia. Al abrir un enlace <code>mailto:</code>, la aplicación de correo predeterminada decide qué cuenta utilizar; DirectLead no puede forzar el remitente.'
        }
      ]
    },
    {
      title: 'Preferencias y navegación',
      items: [
        {
          question: '¿Dónde se guardan mis datos?',
          keywords: 'guardar persistencia base datos local sqlite configuración reiniciar nube sincronización',
          answer: 'Los prospectos se guardan en una base SQLite local y las preferencias de mensajes en este dispositivo. Actualmente no hay sincronización en la nube. Si se incorpora en el futuro, se explicará qué datos se guardarían y se pedirá tu aceptación antes de activarla; si no aceptas, seguirá el almacenamiento local.'
        },
        {
          question: '¿Qué atajos de teclado hay?',
          keywords: 'teclas keyboard N Ctrl K Escape esc personalizar cambiar atajos',
          answer: `Los atajos se pueden consultar y cambiar en la sección <strong>Atajos</strong>. Por defecto, <strong>${escapeHtml(formatShortcut(state.settings.shortcuts.newProspect))}</strong> crea un prospecto, <strong>${escapeHtml(formatShortcut(state.settings.shortcuts.openPalette))}</strong> abre la búsqueda rápida y <strong>${escapeHtml(formatShortcut(state.settings.shortcuts.toggleFullscreen))}</strong> alterna pantalla completa.`
        },
        {
          question: '¿Cómo cambio el ancho de la lista?',
          keywords: 'redimensionar tamaño ancho lista divisor arrastrar flechas',
          answer: 'En una ventana de escritorio, arrastra el separador entre la lista y la ficha. También puedes enfocarlo y usar las flechas izquierda/derecha; con Shift el ajuste es mayor.'
        }
      ]
    }
  ]

  elements.settingsDetail.innerHTML = `
    <div class="w-full max-w-[900px]">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">CENTRO DE AYUDA</p>
      <h2 class="mt-2 font-serif text-[26px] text-text">¿En qué podemos ayudarte?</h2>
      <label class="mt-6 block max-w-[560px]">
        <span class="sr-only">Buscar en Ayuda</span>
        <input id="help-search" type="search" placeholder="Buscar una respuesta..." class="h-10 w-full rounded-md border border-line bg-paper px-3 text-[12px] text-text outline-none placeholder:text-text-muted focus:border-accent" />
      </label>
      <div id="help-sections" class="mt-8 space-y-8">
        ${sections.map((section) => `
          <section data-help-section>
            <h3 class="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">${section.title}</h3>
            <div class="border-t border-line">
              ${section.items.map((item) => `
                <details data-help-item data-search="${escapeHtml(`${item.question} ${item.keywords}`.toLocaleLowerCase())}" class="group border-b border-line">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[13px] text-text-soft transition hover:text-text [&::-webkit-details-marker]:hidden">
                    <span>${item.question}</span>
                    <span aria-hidden="true" class="font-mono text-[16px] text-text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p class="max-w-[720px] pb-4 pr-8 text-[12px] leading-6 text-text-muted">${item.answer}</p>
                </details>`).join('')}
            </div>
          </section>`).join('')}
      </div>
      <p id="help-no-results" hidden class="mt-8 text-[12px] text-text-muted">No encontramos una respuesta con ese término.</p>
    </div>`
}

function filterHelp(query) {
  const term = query.trim().toLocaleLowerCase()
  let visibleCount = 0
  for (const section of elements.settingsDetail.querySelectorAll('[data-help-section]')) {
    const items = section.querySelectorAll('[data-help-item]')
    let sectionHasResults = false
    for (const item of items) {
      const matches = item.dataset.search.includes(term)
      item.hidden = !matches
      sectionHasResults ||= matches
      if (term && matches) item.open = true
      else if (!term) item.open = false
    }
    section.hidden = !sectionHasResults
    if (sectionHasResults) visibleCount += 1
  }
  elements.settingsDetail.querySelector('#help-no-results').hidden = visibleCount > 0
}

function renderSettings() {
  renderSettingsList()
  if (state.selectedSettingId === 'about') renderAbout()
  else if (state.selectedSettingId === 'help') renderHelp()
  else if (state.selectedSettingId === 'shortcuts') renderShortcuts()
  else if (state.selectedSettingId === 'updates') renderUpdates()
  else renderMessageSettings()
  elements.settingsDetail.scrollTop = 0
}

function applyMobileLayout() {
  if (!state.mobile) {
    elements.listPane.style.width = localStorage.getItem('directlead-list-width') || '380px'
    elements.listPane.classList.remove('hidden')
    elements.detailPanel.classList.remove('hidden')
    elements.mobileBack.classList.add('hidden')
    elements.app.dataset.mobileScreen = 'desktop'
    return
  }
  elements.listPane.style.width = '100%'
  const showDetail = state.mobileScreen === 'detail'
  elements.listPane.classList.toggle('hidden', showDetail)
  elements.detailPanel.classList.toggle('hidden', !showDetail)
  elements.mobileBack.classList.toggle('hidden', !showDetail)
  elements.app.dataset.mobileScreen = state.mobileScreen
}

function render() {
  const settings = state.view === 'settings'
  setVisible(elements.viewProspects, !settings, 'flex')
  setVisible(elements.viewSettings, settings, 'flex')
  setVisible(elements.detail, !settings && Boolean(selectedProspect()))
  setVisible(elements.settingsDetail, settings)
  setVisible(elements.detailEmpty, !settings && !selectedProspect(), 'flex')
  elements.search.value = state.search
  renderRail()
  renderList()
  if (settings) renderSettings()
  else renderDetail()
  applyMobileLayout()
}

function openSettings(section = 'messages') {
  state.view = 'settings'
  state.selectedSettingId = section
  state.mobileScreen = 'detail'
  render()
}

function closeSettings() {
  state.view = 'prospects'
  state.mobileScreen = 'list'
  render()
}

function openModal(prospect = null) {
  state.editingId = prospect?.id ?? null
  elements.form.reset()
  elements.formId.value = prospect ? String(prospect.id) : ''
  elements.formName.value = prospect?.business_name ?? ''
  elements.formPhone.value = prospect?.phone ?? ''
  elements.formEmail.value = prospect?.email ?? ''
  elements.formContacted.value = toLocalDateTime(prospect?.contacted_at)
  elements.formUrl.value = prospect?.url ?? ''
  elements.formMessage.value = prospect
    ? renderTemplate(prospect.message || state.settings.whatsappTemplate, prospect)
    : state.settings.whatsappTemplate
  elements.formNotes.value = prospect?.notes ?? ''
  elements.modalLabel.textContent = prospect ? 'EDITAR' : 'NUEVO'
  elements.modalTitle.textContent = prospect ? 'Editar prospecto' : 'Nuevo prospecto'
  elements.submitLabel.textContent = prospect ? 'Guardar cambios' : 'Guardar prospecto'
  setVisible(elements.modalActions, Boolean(prospect))
  setVisible(elements.modal, true, 'grid')
  requestAnimationFrame(() => elements.formName.focus())
}

function closeModal() {
  setVisible(elements.modal, false)
  state.editingId = null
}

function formData() {
  return {
    business_name: elements.formName.value.trim(), phone: elements.formPhone.value.trim(),
    email: elements.formEmail.value.trim(), url: elements.formUrl.value.trim(),
    message: elements.formMessage.value.trim(), notes: elements.formNotes.value.trim(),
    contacted_at: new Date(elements.formContacted.value).toISOString()
  }
}

async function saveProspect(event) {
  event.preventDefault()
  const data = formData()
  try {
    if (state.editingId) {
      await window.api.updateProspect({ id: state.editingId, ...data })
      state.selectedId = state.editingId
      showToast('Prospecto actualizado.')
    } else {
      const created = await window.api.createProspect(data)
      state.selectedId = created?.id ?? null
      showToast('Prospecto guardado.')
    }
    closeModal()
    state.mobileScreen = 'detail'
    await loadProspects()
  } catch (error) {
    console.error(error)
    showToast('No se pudo guardar el prospecto.')
  }
}

async function deleteSelected() {
  const prospect = selectedProspect()
  if (!prospect || !window.confirm(`¿Eliminar a ${prospect.business_name || 'este prospecto'}?`)) return
  try {
    await window.api.deleteProspect(prospect.id)
    state.selectedId = null
    await loadProspects()
    showToast('Prospecto eliminado.')
  } catch (error) {
    console.error(error)
    showToast('No se pudo eliminar el prospecto.')
  }
}

function renderTemplate(template, prospect) {
  const values = {
    business_name: prospect.business_name || '', phone: prospect.phone || '',
    email: prospect.email || '', url: prospect.url || '', my_business: state.settings.myBusiness || ''
  }
  return String(template || '').replace(/\{\s*([a-z_]+)\s*\}/gi, (_, key) => values[key.toLowerCase()] ?? '')
}

function buildWhatsAppUrl(prospect) {
  const phone = String(prospect.phone || '').replace(/\D/g, '')
  if (!phone) return null
  const message = prospect.message || state.settings.whatsappTemplate
  const text = encodeURIComponent(renderTemplate(message, prospect))
  return state.settings.whatsappOpenWith === 'desktop'
    ? `whatsapp://send?phone=${phone}&text=${text}` : `https://wa.me/${phone}?text=${text}`
}

function buildEmailUrl(prospect) {
  if (!prospect.email) return null
  const subject = encodeURIComponent(renderTemplate(state.settings.emailSubject, prospect))
  const body = encodeURIComponent(renderTemplate(state.settings.emailBody, prospect))
  return `mailto:${encodeURIComponent(prospect.email)}?subject=${subject}&body=${body}`
}

async function openExternal(url) {
  if (!url) return
  try {
    const result = await window.api.openExternal(url)
    if (result && !result.ok) throw new Error(result.error)
  } catch (error) {
    console.error(error)
    showToast('No se pudo abrir el enlace.')
  }
}

async function openWhatsApp(prospect) {
  const url = buildWhatsAppUrl(prospect)
  if (!url) return showToast('Este prospecto no tiene teléfono.')
  if (state.settings.whatsappOpenWith === 'desktop' && !await window.api.isWhatsAppDesktopInstalled()) {
    return openExternal('https://www.whatsapp.com/download')
  }
  openExternal(url)
}

function openEmail(prospect) {
  const url = buildEmailUrl(prospect)
  if (!url) return showToast('Este prospecto no tiene email.')
  openExternal(url)
}

async function saveInlineField(field) {
  const prospect = selectedProspect()
  if (!prospect) return
  const key = field.dataset.field
  const value = field.textContent.trim()
  if ((prospect[key] || '') === value) return
  const data = {
    id: prospect.id, business_name: prospect.business_name, phone: prospect.phone,
    email: prospect.email || '', url: prospect.url || '', message: prospect.message || '',
    notes: prospect.notes || '', contacted_at: prospect.contacted_at, [key]: value
  }
  try {
    await window.api.updateProspect(data)
    await loadProspects()
  } catch (error) {
    console.error(error)
    showToast('No se pudo guardar el cambio.')
  }
}

function openPalette() {
  setVisible(elements.palette, true, 'flex')
  elements.paletteInput.value = ''
  renderPalette()
  requestAnimationFrame(() => elements.paletteInput.focus())
}

function closePalette() {
  setVisible(elements.palette, false)
}

const legalTitles = {
  privacy: 'Política de Privacidad de DirectLead',
  terms: 'Términos de Uso de DirectLead'
}

async function openLegalDocument(documentId, { termsGate = false } = {}) {
  if (!Object.hasOwn(legalTitles, documentId)) return
  const requestId = ++state.legalRequestId
  state.termsGateActive = termsGate
  elements.app.inert = termsGate
  elements.legalTitle.textContent = legalTitles[documentId]
  elements.legalContent.innerHTML = '<p class="text-[12px] text-text-muted">Cargando documento...</p>'
  setVisible(elements.legalClose, !termsGate, 'grid')
  setVisible(elements.legalFooterClose, !termsGate)
  setVisible(elements.termsFooter, termsGate)
  setVisible(elements.termsConsent, termsGate && documentId === 'terms')
  setVisible(elements.termsPrivacy, termsGate && documentId === 'terms')
  setVisible(elements.termsReturn, termsGate && documentId === 'privacy')
  elements.termsCheckbox.checked = false
  elements.termsCheckbox.disabled = termsGate
  elements.termsAccept.disabled = true
  setVisible(elements.termsAccept, termsGate && documentId === 'terms')
  setVisible(elements.legalModal, true, 'grid')
  requestAnimationFrame(() => {
    if (termsGate) elements.termsReject.focus()
    else elements.legalClose.focus()
  })

  try {
    const html = await window.api.getLegalDocument(documentId)
    if (requestId !== state.legalRequestId || elements.legalModal.hidden) return
    elements.legalContent.innerHTML = html
    elements.legalContent.scrollTop = 0
    if (termsGate && documentId === 'terms') {
      elements.termsCheckbox.disabled = false
      elements.termsAccept.disabled = !elements.termsCheckbox.checked
    }
  } catch (error) {
    console.error(error)
    if (requestId !== state.legalRequestId) return
    elements.legalContent.textContent = 'No se pudo cargar el documento. Vuelve a intentarlo.'
  }
}

function closeLegalDocument() {
  if (state.termsGateActive) return
  state.legalRequestId += 1
  setVisible(elements.legalModal, false)
}

function acceptTerms() {
  if (!state.termsGateActive || elements.termsCheckbox.disabled || !elements.termsCheckbox.checked) return
  localStorage.setItem(TERMS_ACCEPTANCE_KEY, TERMS_VERSION)
  state.termsGateActive = false
  elements.app.inert = false
  closeLegalDocument()
}

function rejectTerms() {
  if (state.termsGateActive) window.api.quitApp()
}

function paletteItems() {
  const actions = [
    { id: 'new', label: 'Nuevo prospecto', kind: 'Acción' },
    { id: 'messages', label: 'Configuración de Mensajes', kind: 'Configuración' },
    { id: 'shortcuts', label: 'Atajos de teclado', kind: 'Configuración' },
    { id: 'updates', label: 'Actualizaciones', kind: 'Sistema' },
    { id: 'help', label: 'Ayuda', kind: 'Configuración' },
    { id: 'about', label: 'Acerca de', kind: 'Configuración' },
    { id: 'privacy', label: 'Privacidad de DirectLead', kind: 'Legal' },
    { id: 'terms', label: 'Términos de uso de DirectLead', kind: 'Legal' },
    { id: 'prospects', label: 'Ver prospectos', kind: 'Navegación' }
  ]
  const prospects = state.prospects.map((prospect) => ({
    id: `prospect:${prospect.id}`, label: prospect.business_name || prospect.phone, kind: 'Prospecto'
  }))
  const term = elements.paletteInput.value.trim().toLocaleLowerCase()
  return [...actions, ...prospects].filter((item) => item.label.toLocaleLowerCase().includes(term))
}

function renderPalette() {
  const items = paletteItems()
  state.paletteIndex = Math.max(0, Math.min(state.paletteIndex, items.length - 1))
  elements.paletteResults.innerHTML = items.length ? items.map((item, index) => `
    <button type="button" data-command="${item.id}" data-palette-index="${index}" aria-selected="${index === state.paletteIndex}" class="flex w-full items-center justify-between rounded-md px-3 py-3 text-left ${index === state.paletteIndex ? 'bg-paper-light text-text' : 'text-text-soft hover:bg-paper-light'}">
      <span class="text-[12px]">${escapeHtml(item.label)}</span><span class="text-[10px] text-text-muted">${item.kind}</span>
    </button>`).join('') : '<p class="px-3 py-5 text-center text-[12px] text-text-muted">Sin resultados</p>'
  elements.paletteResults.querySelector(`[data-palette-index="${state.paletteIndex}"]`)
    ?.scrollIntoView({ block: 'nearest' })
}

function runCommand(id) {
  closePalette()
  if (id === 'new') return openModal()
  if (id === 'messages') return openSettings('messages')
  if (id === 'about') return openSettings('about')
  if (id === 'help') return openSettings('help')
  if (id === 'shortcuts') return openSettings('shortcuts')
  if (id === 'updates') return openSettings('updates')
  if (id === 'privacy' || id === 'terms') return openLegalDocument(id)
  if (id === 'prospects') return closeSettings()
  if (id.startsWith('prospect:')) {
    state.view = 'prospects'
    state.selectedId = Number(id.slice('prospect:'.length))
    state.mobileScreen = 'detail'
    render()
  }
}

function selectProspect(id) {
  state.selectedId = Number(id)
  state.view = 'prospects'
  state.mobileScreen = 'detail'
  render()
}

function selectAdjacentProspect(direction) {
  const index = state.prospects.findIndex((prospect) => prospect.id === state.selectedId)
  const next = state.prospects[index + direction]
  if (next) selectProspect(next.id)
}

function insertVariable(key, target) {
  if (!target) return
  const token = `{ ${key} }`
  const start = target.selectionStart ?? target.value.length
  const end = target.selectionEnd ?? target.value.length
  target.setRangeText(token, start, end, 'end')
  target.dispatchEvent(new Event('input', { bubbles: true }))
  target.focus()
}

function updateSetting(target) {
  const map = {
    'settings-business': 'myBusiness', 'settings-whatsapp-template': 'whatsappTemplate',
    'settings-whatsapp-open': 'whatsappOpenWith',
    'settings-email-subject': 'emailSubject', 'settings-email-from': 'emailFrom',
    'settings-email-body': 'emailBody'
  }
  const key = map[target.id]
  if (!key) return
  state.settings[key] = target.value
  saveSettings()
}


elements.newButton.addEventListener('click', () => openModal())
elements.railProspects.addEventListener('click', closeSettings)
elements.railUpdates.addEventListener('click', () => openSettings('updates'))
elements.railSettings.addEventListener('click', () => openSettings('messages'))
elements.search.addEventListener('input', (event) => {
  state.search = event.target.value
  renderList()
})
elements.prospectList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-prospect-id]')
  if (button) selectProspect(button.dataset.prospectId)
})
elements.settingsList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-setting-id]')
  if (!button) return
  state.selectedSettingId = button.dataset.settingId
  renderSettings()
})
elements.settingsDetail.addEventListener('input', (event) => {
  if (event.target.id === 'help-search') filterHelp(event.target.value)
  else updateSetting(event.target)
})
elements.settingsDetail.addEventListener('change', (event) => updateSetting(event.target))
elements.settingsDetail.addEventListener('click', (event) => {
  const updateAction = event.target.closest('[data-update-action]')
  if (updateAction) {
    runUpdateAction(updateAction.dataset.updateAction)
    return
  }

  const legalButton = event.target.closest('[data-legal-open]')
  if (legalButton) {
    openLegalDocument(legalButton.dataset.legalOpen)
    return
  }

  const captureButton = event.target.closest('[data-shortcut-capture]')
  if (captureButton) {
    state.shortcutCapture = captureButton.dataset.shortcutCapture
    captureButton.textContent = 'Pulsa una tecla...'
    captureButton.setAttribute('aria-label', 'Pulsa la combinación que quieres asignar')
    captureButton.focus()
    return
  }

  if (event.target.closest('[data-shortcuts-reset]')) {
    state.settings.shortcuts = Object.fromEntries(Object.entries(defaults.shortcuts).map(([id, binding]) => [
      id,
      { ...binding }
    ]))
    state.shortcutCapture = null
    saveSettings()
    renderShortcuts()
    showToast('Atajos predeterminados restaurados.')
    return
  }

  const externalLink = event.target.closest('[data-external-url]')
  if (externalLink) {
    event.preventDefault()
    openExternal(externalLink.href)
    return
  }
  const tab = event.target.closest('[data-channel]')
  if (tab) {
    state.messageChannel = tab.dataset.channel
    renderMessageSettings()
    return
  }
  const button = event.target.closest('[data-variable]')
  if (button) insertVariable(button.dataset.variable, elements.settingsDetail.querySelector(
    state.messageChannel === 'whatsapp' ? '#settings-whatsapp-template' : '#settings-email-body'
  ))
})
elements.settingsDetail.addEventListener('keydown', (event) => {
  const captureButton = event.target.closest('[data-shortcut-capture]')
  if (!captureButton) return
  event.preventDefault()
  event.stopPropagation()

  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return

  const id = captureButton.dataset.shortcutCapture
  const binding = shortcutFromEvent(event)
  const conflict = SHORTCUTS.find((shortcut) =>
    shortcut.id !== id && shortcutsEqual(binding, state.settings.shortcuts[shortcut.id])
  )
  if (conflict) {
    showToast(`Ese atajo ya está asignado a "${conflict.title}".`)
    return
  }

  state.settings.shortcuts[id] = binding
  state.shortcutCapture = null
  saveSettings()
  renderShortcuts()
})
elements.edit.addEventListener('click', () => {
  const prospect = selectedProspect()
  if (prospect) openModal(prospect)
})
elements.delete.addEventListener('click', deleteSelected)
elements.whatsapp.addEventListener('click', () => {
  const prospect = selectedProspect()
  if (prospect) openWhatsApp(prospect)
})
elements.email.addEventListener('click', () => {
  const prospect = selectedProspect()
  if (prospect) openEmail(prospect)
})
elements.openUrl.addEventListener('click', () => openExternal(selectedProspect()?.url))
elements.pagePrev.addEventListener('click', () => selectAdjacentProspect(-1))
elements.pageNext.addEventListener('click', () => selectAdjacentProspect(1))
elements.detail.addEventListener('focusout', (event) => {
  const field = event.target.closest('[data-field][contenteditable="true"]')
  if (field) saveInlineField(field)
})

for (const field of document.querySelectorAll('#prospect-detail [data-field]')) {
  field.contentEditable = 'true'
  field.tabIndex = 0
  field.setAttribute('role', 'textbox')
  field.setAttribute('aria-label', field.dataset.field.replaceAll('_', ' '))
}

elements.form.addEventListener('submit', saveProspect)
elements.modalClose.addEventListener('click', closeModal)
elements.modalCancel.addEventListener('click', closeModal)
elements.modal.addEventListener('click', (event) => {
  if (event.target === elements.modal) closeModal()
})
elements.modalWhatsapp.addEventListener('click', () => {
  const prospect = selectedProspect()
  if (prospect) openWhatsApp({ ...prospect, ...formData() })
})
elements.modalEmail.addEventListener('click', () => {
  const prospect = selectedProspect()
  if (prospect) openEmail({ ...prospect, ...formData() })
})
elements.paletteTrigger.addEventListener('click', openPalette)
elements.paletteInput.addEventListener('input', () => {
  state.paletteIndex = 0
  renderPalette()
})
elements.paletteResults.addEventListener('click', (event) => {
  const button = event.target.closest('[data-command]')
  if (button) runCommand(button.dataset.command)
})
elements.palette.addEventListener('click', (event) => {
  if (event.target === elements.palette) closePalette()
})
elements.legalClose.addEventListener('click', closeLegalDocument)
elements.legalFooterClose.addEventListener('click', closeLegalDocument)
elements.termsCheckbox.addEventListener('change', () => {
  elements.termsAccept.disabled = !elements.termsCheckbox.checked
})
elements.termsPrivacy.addEventListener('click', () => openLegalDocument('privacy', { termsGate: true }))
elements.termsReturn.addEventListener('click', () => openLegalDocument('terms', { termsGate: true }))
elements.termsAccept.addEventListener('click', acceptTerms)
elements.termsReject.addEventListener('click', rejectTerms)
elements.legalModal.addEventListener('click', (event) => {
  if (!state.termsGateActive && (event.target === elements.legalModal || event.target.closest('[data-legal-close]'))) {
    closeLegalDocument()
  }
})
elements.legalContent.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]')
  if (!link) return
  event.preventDefault()
  openExternal(link.href)
})

window.api.onUpdateState((update) => {
  state.update = update
  renderRail()
  renderSettingsList()
  if (state.view === 'settings' && state.selectedSettingId === 'updates') renderUpdates()
})

window.api.getUpdateState().then((update) => {
  state.update = update
  renderRail()
  renderSettingsList()
  if (state.view === 'settings' && state.selectedSettingId === 'updates') renderUpdates()
}).catch((error) => {
  console.error('No se pudo leer el estado de actualizaciones.', error)
})

elements.mobileBack.addEventListener('click', () => {
  state.mobileScreen = 'list'
  render()
})

let resizeStart = null
elements.resizeHandle.addEventListener('pointerdown', (event) => {
  if (state.mobile || event.button !== 0) return
  resizeStart = { x: event.clientX, width: elements.listPane.getBoundingClientRect().width }
  elements.resizeHandle.setPointerCapture(event.pointerId)
  document.body.classList.add('select-none')
})
elements.resizeHandle.addEventListener('pointermove', (event) => {
  if (!resizeStart) return
  const maxWidth = Math.max(240, Math.min(640, window.innerWidth - 500))
  const width = Math.max(240, Math.min(maxWidth, resizeStart.width + event.clientX - resizeStart.x))
  elements.listPane.style.width = `${width}px`
  elements.resizeHandle.setAttribute('aria-valuenow', String(Math.round(width)))
})
function finishResize() {
  if (!resizeStart) return
  localStorage.setItem('directlead-list-width', elements.listPane.style.width)
  resizeStart = null
  document.body.classList.remove('select-none')
}
elements.resizeHandle.addEventListener('pointerup', finishResize)
elements.resizeHandle.addEventListener('pointercancel', finishResize)
elements.resizeHandle.addEventListener('keydown', (event) => {
  const direction = shortcutMatches(event, 'resizeNarrower')
    ? -1
    : shortcutMatches(event, 'resizeWider') ? 1 : 0
  if (!direction) return
  event.preventDefault()
  const current = elements.listPane.getBoundingClientRect().width
  const step = event.shiftKey ? 40 : 12
  const maxWidth = Math.max(240, Math.min(640, window.innerWidth - 500))
  const width = Math.max(240, Math.min(maxWidth, current + direction * step))
  elements.listPane.style.width = `${width}px`
  elements.resizeHandle.setAttribute('aria-valuenow', String(Math.round(width)))
  localStorage.setItem('directlead-list-width', elements.listPane.style.width)
})

document.addEventListener('keydown', (event) => {
  const typing = event.target.matches('input, textarea, select, [contenteditable="true"]')
  if (shortcutMatches(event, 'toggleFullscreen')) {
    event.preventDefault()
    window.api.toggleFullscreen()
    return
  }
  if (state.termsGateActive) return
  if (shortcutMatches(event, 'openPalette')) {
    event.preventDefault()
    openPalette()
    return
  }
  if (shortcutMatches(event, 'closeActive')) {
    if (!elements.palette.hidden) closePalette()
    else if (!elements.legalModal.hidden) closeLegalDocument()
    else if (!elements.modal.hidden) closeModal()
    else if (state.view === 'settings') closeSettings()
    return
  }
  if (!elements.palette.hidden) {
    const items = paletteItems()
    if (shortcutMatches(event, 'paletteNext')) {
      event.preventDefault()
      state.paletteIndex = Math.min(state.paletteIndex + 1, items.length - 1)
      renderPalette()
    } else if (shortcutMatches(event, 'palettePrevious')) {
      event.preventDefault()
      state.paletteIndex = Math.max(0, state.paletteIndex - 1)
      renderPalette()
    } else if (shortcutMatches(event, 'paletteSelect') && items[state.paletteIndex]) {
      event.preventDefault()
      runCommand(items[state.paletteIndex].id)
    }
    return
  }
  if (!typing && elements.modal.hidden && shortcutMatches(event, 'newProspect')) openModal()
})

window.addEventListener('resize', () => {
  state.mobile = window.matchMedia('(max-width: 800px)').matches
  applyMobileLayout()
})

const savedWidth = localStorage.getItem('directlead-list-width')
if (savedWidth) elements.listPane.style.width = savedWidth
if (state.termsGateActive) openLegalDocument('terms', { termsGate: true })
loadProspects()