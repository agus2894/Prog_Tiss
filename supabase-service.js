// Servicio de Supabase para gestión de datos de UTI
class SupabaseService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.offlineMode = false;
    }

    // Inicializar cliente de Supabase
    async init() {
        try {
            if (typeof supabase === 'undefined') {
                console.warn('⚠️ Cliente de Supabase no disponible. Usando modo offline.');
                this.offlineMode = true;
                return false;
            }

            if (SUPABASE_CONFIG.anonKey === 'TU_ANON_KEY_AQUI') {
                console.warn('⚠️ ANON KEY no configurada. Usando modo offline.');
                this.offlineMode = true;
                return false;
            }

            this.supabase = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            
            this.initialized = true;
            console.log('✅ Supabase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            this.offlineMode = true;
            return false;
        }
    }

    // Guardar estado completo de las camas
    async saveBeds(beds, turno, enfermeros, notas) {
        if (this.offlineMode || !this.initialized) {
            console.log('📴 Modo offline: guardando en localStorage');
            return this._saveToLocalStorage(beds, turno, enfermeros, notas);
        }

        try {
            // Preparar datos para Supabase
            const data = {
                beds: beds,
                turno: turno,
                enfermeros: enfermeros,
                notas: notas,
                updated_at: new Date().toISOString()
            };

            // Intentar actualizar registro existente
            const { data: existingData, error: fetchError } = await this.supabase
                .from('uti_state')
                .select('id')
                .limit(1)
                .single();

            if (existingData) {
                // Actualizar registro existente
                const { error: updateError } = await this.supabase
                    .from('uti_state')
                    .update(data)
                    .eq('id', existingData.id);

                if (updateError) throw updateError;
            } else {
                // Crear nuevo registro
                const { error: insertError } = await this.supabase
                    .from('uti_state')
                    .insert([data]);

                if (insertError) throw insertError;
            }

            console.log('✅ Datos guardados en Supabase');
            
            // También guardar en localStorage como respaldo
            this._saveToLocalStorage(beds, turno, enfermeros, notas);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando en Supabase:', error);
            // Fallback a localStorage
            return this._saveToLocalStorage(beds, turno, enfermeros, notas);
        }
    }

    // Cargar estado de las camas
    async loadBeds() {
        if (this.offlineMode || !this.initialized) {
            console.log('📴 Modo offline: cargando desde localStorage');
            return this._loadFromLocalStorage();
        }

        try {
            const { data, error } = await this.supabase
                .from('uti_state')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No hay datos, retornar desde localStorage o valores por defecto
                    console.log('ℹ️ No hay datos en Supabase, usando localStorage');
                    return this._loadFromLocalStorage();
                }
                throw error;
            }

            if (data) {
                console.log('✅ Datos cargados desde Supabase');
                
                // También guardar en localStorage como respaldo
                this._saveToLocalStorage(
                    data.beds || [],
                    data.turno || 'mañana',
                    data.enfermeros || 0,
                    data.notas || ''
                );

                return {
                    beds: data.beds || [],
                    turno: data.turno || 'mañana',
                    enfermeros: data.enfermeros || 0,
                    notas: data.notas || ''
                };
            }

            return this._loadFromLocalStorage();
        } catch (error) {
            console.error('❌ Error cargando desde Supabase:', error);
            return this._loadFromLocalStorage();
        }
    }

    // Guardar historial de un turno (opcional - para mantener histórico)
    async saveShiftHistory(beds, turno, enfermeros, notas) {
        if (this.offlineMode || !this.initialized) {
            return { success: false, message: 'Modo offline' };
        }

        try {
            const { error } = await this.supabase
                .from('shift_history')
                .insert([{
                    beds: beds,
                    turno: turno,
                    enfermeros: enfermeros,
                    notas: notas,
                    fecha: new Date().toISOString()
                }]);

            if (error) throw error;

            console.log('✅ Historial de turno guardado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando historial:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener historial de turnos
    async getShiftHistory(limit = 10) {
        if (this.offlineMode || !this.initialized) {
            return [];
        }

        try {
            const { data, error } = await this.supabase
                .from('shift_history')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return [];
        }
    }

    // --- Métodos privados para localStorage ---
    _saveToLocalStorage(beds, turno, enfermeros, notas) {
        try {
            localStorage.setItem('tissUTIBeds', JSON.stringify(beds));
            localStorage.setItem('tissUTITurno', turno);
            localStorage.setItem('tissUTIEnfermeros', enfermeros);
            localStorage.setItem('tissUTINotas', notas);
            return { success: true, offline: true };
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
            return { success: false, error: e.message };
        }
    }

    _loadFromLocalStorage() {
        const beds = localStorage.getItem('tissUTIBeds');
        const turno = localStorage.getItem('tissUTITurno');
        const enfermeros = localStorage.getItem('tissUTIEnfermeros');
        const notas = localStorage.getItem('tissUTINotas');

        return {
            beds: beds ? JSON.parse(beds) : [],
            turno: turno || 'mañana',
            enfermeros: enfermeros ? parseInt(enfermeros) : 0,
            notas: notas || ''
        };
    }

    // Verificar estado de la conexión
    isOnline() {
        return !this.offlineMode && this.initialized;
    }

    // Forzar sincronización desde localStorage a Supabase
    async syncFromLocalStorage() {
        if (this.offlineMode || !this.initialized) {
            return { success: false, message: 'Supabase no disponible' };
        }

        const localData = this._loadFromLocalStorage();
        const result = await this.saveBeds(
            localData.beds,
            localData.turno,
            localData.enfermeros,
            localData.notas
        );

        if (result.success) {
            console.log('✅ Sincronización completada');
            return { success: true, message: 'Datos sincronizados' };
        }

        return { success: false, message: 'Error en sincronización' };
    }
}

// Instancia global del servicio
const supabaseService = new SupabaseService();
