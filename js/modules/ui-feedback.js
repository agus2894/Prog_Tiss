// ============================================
// FEEDBACK Y NOTIFICACIONES UI
// ============================================

import { DOMCache } from './dom-cache.js';

// Mostrar notificación Toast profesional
export function mostrarFeedback(mensaje, tipo = 'success') {
    if (!DOMCache.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
    };
    
    // Usar textContent para seguridad
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = iconos[tipo] || iconos.success;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = mensaje;
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    
    DOMCache.toastContainer.appendChild(toast);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confirmación elegante (reemplazo de confirm())
export function confirmarAccion(mensaje, callback) {
    const confirmacion = confirm(mensaje);
    if (confirmacion) {
        callback();
    }
}

// Actualizar indicador visual de guardado
export function updateSaveIndicator(saveStatus) {
    if (!DOMCache.saveIndicator) return;
    
    const estados = {
        saved: { text: '✓ Guardado', class: 'saved' },
        saving: { text: '⏳ Guardando...', class: 'saving' },
        pending: { text: '⋯ Pendiente', class: 'pending' }
    };
    
    const estado = estados[saveStatus];
    DOMCache.saveIndicator.textContent = estado.text;
    DOMCache.saveIndicator.className = `save-indicator ${estado.class}`;
}

// Actualizar indicador de estado de Supabase
export function updateSupabaseStatus(isOnline) {
    if (!DOMCache.supabaseStatus || !DOMCache.supabaseStatusIcon || !DOMCache.supabaseStatusText) return;
    
    if (isOnline) {
        DOMCache.supabaseStatus.style.display = 'block';
        DOMCache.supabaseStatus.style.backgroundColor = '#d4edda';
        DOMCache.supabaseStatus.style.color = '#155724';
        DOMCache.supabaseStatusIcon.textContent = '✅';
        DOMCache.supabaseStatusText.textContent = 'Conectado a Supabase - Datos sincronizados';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            DOMCache.supabaseStatus.style.display = 'none';
        }, 3000);
    } else {
        DOMCache.supabaseStatus.style.display = 'block';
        DOMCache.supabaseStatus.style.backgroundColor = '#fff3cd';
        DOMCache.supabaseStatus.style.color = '#856404';
        DOMCache.supabaseStatusIcon.textContent = '📴';
        DOMCache.supabaseStatusText.textContent = 'Modo offline - Datos guardados localmente';
    }
}
