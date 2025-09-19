// ===== IMPORTAR SUPABASE =====
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ===== CONFIGURACIÓN SUPABASE =====
const SUPABASE_URL = 'https://zqowhanlhhjueqprxrvt.supabase.co'
const SUPABASE_KEY = 'TU_ANON_KEY_AQUI' // ← reemplaza esto con tu anon public key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== ELEMENTOS DEL DOM =====
const btnLogin = document.getElementById('btn-login')
const loginPopup = document.getElementById('login-popup')
const loginForm = document.querySelector('.login-form')
const subirBtn = document.getElementById('subir-doc')
const galeria = document.querySelector('.galeria')
const body = document.body
const mensaje = document.getElementById('mensaje')

// ===== CREDENCIALES ADMIN =====
const ADMIN_EMAIL = "geison.c.samaniego@gmail.com"
const ADMIN_PASSWORD = "123456789"

// ===== FUNCIONES AUXILIARES =====
function mostrarMensaje(texto) {
  mensaje.textContent = texto
  mensaje.classList.remove('oculto')
  mensaje.classList.add('visible')

  setTimeout(() => {
    mensaje.classList.remove('visible')
    mensaje.classList.add('oculto')
  }, 3000)
}

// ===== LOGIN POPUP =====
btnLogin.addEventListener('click', () => {
  loginPopup.classList.remove('oculto')
  loginPopup.classList.add('visible')
  body.style.filter = 'brightness(0.4)'
})

loginPopup.addEventListener('click', (e) => {
  if (e.target === loginPopup) {
    loginPopup.classList.add('oculto')
    loginPopup.classList.remove('visible')
    body.style.filter = 'brightness(1)'
  }
})

// ===== LOGIN VALIDACIÓN =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = loginForm.querySelector('input[type="email"]').value
  const password = loginForm.querySelector('input[type="password"]').value

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    mostrarMensaje("Sesión iniciada como administrador")
    subirBtn.style.display = 'block'
  } else {
    mostrarMensaje("Sesión iniciada como visitante")
    subirBtn.style.display = 'none'
  }

  loginPopup.classList.add('oculto')
  loginPopup.classList.remove('visible')
  body.style.filter = 'brightness(1)'

  cargarDocumentos()
})

// ===== SUBIR DOCUMENTO =====
subirBtn.addEventListener('click', async () => {
  const semana = prompt("¿A qué semana deseas subir el documento? (1 al 16)")
  if (!semana || isNaN(semana) || semana < 1 || semana > 16) {
    mostrarMensaje("Semana inválida")
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf'
  input.click()

  input.addEventListener('change', async () => {
    const file = input.files[0]
    if (!file) return

    const filePath = `semana-${semana}/${file.name}`
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(filePath, file, { upsert: true })

    if (error) {
      console.error("Error al subir:", error)
      mostrarMensaje("Error al subir el documento.")
    } else {
      mostrarMensaje("Documento subido a semana " + semana)
      cargarDocumentos()
    }
  })
})

// ===== CARGAR DOCUMENTOS POR SEMANA =====
async function cargarDocumentos() {
  galeria.innerHTML = ''

  for (let i = 1; i <= 16; i++) {
    const { data, error } = await supabase.storage
      .from('documentos')
      .list(`semana-${i}`, { limit: 100 })

    const div = document.createElement('div')
    div.classList.add('proyecto')
    div.innerHTML = `<div class="overlay"><h3>Semana ${i}</h3></div>`

    if (data && data.length > 0) {
      data.forEach(doc => {
        const url = supabase.storage
          .from('documentos')
          .getPublicUrl(`semana-${i}/${doc.name}`).data.publicUrl

        const enlace = document.createElement('a')
        enlace.href = url
        enlace.textContent = doc.name
        enlace.target = '_blank'
        enlace.style.display = 'block'
        enlace.style.color = '#fff'
        enlace.style.marginTop = '5px'

        div.querySelector('.overlay').appendChild(enlace)
      })
    }

    galeria.appendChild(div)
  }
}
