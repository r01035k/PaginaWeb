// ================== IMPORTAR SUPABASE ==================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ================== CONFIGURACIÓN SUPABASE ==================
const SUPABASE_URL = 'https://zqowhanlhhjueqprxrvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb3doYW5saGhqdWVxcHJ4cnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTQ3MDQsImV4cCI6MjA3MzgzMDcwNH0.gqUUKlZXow6UpVrEWd77XPbZO4p0IiDdZ5Cq3QMY178';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ================== ELEMENTOS DEL DOM ==================
const btnLogin = document.getElementById('btn-login');
const loginPopup = document.getElementById('login-popup');
const loginForm = document.querySelector('.login-form');
const subirBtn = document.getElementById('subir-doc');
const galeria = document.querySelector('.galeria');
const body = document.body;

// ================== LOGIN HARD-CODEADO ==================
const ADMIN_EMAIL = "geison.c.samaniego@gmail.com";
const ADMIN_PASSWORD = "123456789";

// ================== FUNCIONALIDAD POPUP LOGIN ==================
btnLogin.addEventListener('click', () => {
    loginPopup.classList.add('visible');
    body.style.filter = 'brightness(0.4)'; // oscurece la página
});

loginPopup.addEventListener('click', (e) => {
    if(e.target === loginPopup){
        loginPopup.classList.remove('visible');
        body.style.filter = 'brightness(1)';
    }
});

// ================== LOGIN ==================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    if(email === ADMIN_EMAIL && password === ADMIN_PASSWORD){
        alert("Bienvenido, administrador");
        loginPopup.classList.remove('visible');
        body.style.filter = 'brightness(1)';
        subirBtn.style.display = 'block';
    } else {
        alert("Bienvenido, visitante");
        loginPopup.classList.remove('visible');
        body.style.filter = 'brightness(1)';
        subirBtn.style.display = 'none';
    }

    cargarDocumentos();
});

// ================== SUBIR DOCUMENTOS ==================
subirBtn.addEventListener('click', async () => {
    const semana = prompt("¿A qué semana quieres subir el documento? (1-16)");
    if(!semana || isNaN(semana) || semana < 1 || semana > 16){
        alert("Semana inválida");
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = true;
    input.click();

    input.addEventListener('change', async () => {
        const files = input.files;
        for(let i=0; i<files.length; i++){
            const file = files[i];
            const nombreArchivo = `semana${semana}/${file.name}`; // Carpeta por semana
            const { data, error } = await supabase.storage
                .from('documentos')
                .upload(nombreArchivo, file);

            if(error){
                console.error(error);
                alert("Error al subir el archivo: " + file.name);
            } else {
                console.log('Archivo subido: ' + file.name);
            }
        }
        cargarDocumentos();
    });
});

// ================== CARGAR DOCUMENTOS ==================
async function cargarDocumentos(){
    const { data, error } = await supabase.storage
        .from('documentos')
        .list('', { limit: 100, offset: 0 });

    if(error){
        console.error(error);
        return;
    }

    galeria.innerHTML = '';
    data.forEach(doc => {
        const publicUrl = supabase.storage.from('documentos').getPublicUrl(doc.name).data.publicUrl;
        const div = document.createElement('div');
        div.classList.add('proyecto');
        div.innerHTML = `
            <div class="overlay">
                <h3>${doc.name}</h3>
                <a href="${publicUrl}" target="_blank">Descargar</a>
            </div>
        `;
        galeria.appendChild(div);
    });
}

// ================== CARGAR DOCUMENTOS AL INICIO ==================
cargarDocumentos();
