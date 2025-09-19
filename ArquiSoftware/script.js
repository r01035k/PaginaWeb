// ================== IMPORTAR SUPABASE ==================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ================== CONFIGURACIÓN SUPABASE ==================
const SUPABASE_URL = 'https://zqowhanlhhjueqprxrvt.supabase.co'
const SUPABASE_KEY = 'zrf!MtWip&fc85U' // reemplaza con tu anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ================== ELEMENTOS DEL DOM ==================
const btnLogin = document.getElementById('btn-login')
const loginPopup = document.getElementById('login-popup')
const loginForm = document.querySelector('.login-form')
const subirBtn = document.getElementById('subir-doc')
const galeria = document.querySelector('.galeria')
const body = document.body

// ================== LOGIN HARD-CODEADO ==================
const ADMIN_EMAIL = "geison.c.samaniego@gmail.com"
const ADMIN_PASSWORD = "123456789"

// ================== FUNCIONALIDAD POPUP LOGIN ==================
btnLogin.addEventListener('click', () => {
    loginPopup.classList.add('visible')   // mostrar popup
    body.style.filter = 'brightness(0.4)' // oscurece la página
})

loginPopup.addEventListener('click', (e) => {
    if(e.target === loginPopup){
        loginPopup.classList.remove('visible')
        body.style.filter = 'brightness(1)'
    }
})

// ================== LOGIN ==================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = loginForm.querySelector('input[type="email"]').value
    const password = loginForm.querySelector('input[type="password"]').value

    loginPopup.classList.remove('visible')
    body.style.filter = 'brightness(1)'

    if(email === ADMIN_EMAIL && password === ADMIN_PASSWORD){
        alert("Inicio de sesión como admin")
        subirBtn.style.display = 'block'
        window.isAdmin = true
    } else {
        alert("Usuario normal")
        subirBtn.style.display = 'none'
        window.isAdmin = false
    }

    cargarDocumentos()
})

// ================== SUBIR DOCUMENTOS ==================
subirBtn.addEventListener('click', async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.multiple = true
    input.click()

    input.addEventListener('change', async () => {
        const files = input.files
        for(let i=0; i<files.length; i++){
            const file = files[i]
            const { data, error } = await supabase.storage
                .from('documentos')
                .upload(file.name, file, {upsert:true})

            if(error){
                console.error(error)
            } else {
                console.log('Archivo subido: ' + file.name)
            }
        }
        cargarDocumentos()
    })
})

// ================== CARGAR DOCUMENTOS ==================
async function cargarDocumentos(){
    const { data, error } = await supabase.storage
        .from('documentos')
        .list('', { limit: 100 })

    if(error){
        console.error(error)
        return
    }

    galeria.innerHTML = ''
    data.forEach(doc => {
        const div = document.createElement('div')
        div.classList.add('proyecto')

        let deleteBtn = ''
        if(window.isAdmin){
            deleteBtn = `<button class="delete-btn" data-name="${doc.name}">Eliminar</button>`
        }

        div.innerHTML = `
            <div class="overlay">
                <h3>${doc.name}</h3>
                <a href="${supabase.storage.from('documentos').getPublicUrl(doc.name).data.publicUrl}" target="_blank">Descargar</a>
                ${deleteBtn}
            </div>
        `
        galeria.appendChild(div)
    })

    // ================== ELIMINAR DOCUMENTOS ==================
    if(window.isAdmin){
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const fileName = btn.dataset.name
                const { error } = await supabase.storage
                    .from('documentos')
                    .remove([fileName])
                if(error){
                    console.error(error)
                } else {
                    console.log('Archivo eliminado: ' + fileName)
                    cargarDocumentos()
                }
            })
        })
    }
}

// ================== CARGAR DOCUMENTOS AL INICIO ==================
cargarDocumentos()