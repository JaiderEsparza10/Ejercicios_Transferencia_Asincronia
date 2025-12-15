// Mensaje inicial del programa
console.log("----- 3 VALIDACIÓN DE UN FORMULARIO CON MÚLTIPLES VERIFICACIONES EXTERNAS -----");

// --- DATOS DE ENTRADA ---
// Se definen los datos del formulario a validar
const datosFormulario = {
    nombre: "Sofia Ramirez",
    correo: "sofia.ramirez@ejemplo.com",
    documento: "102456789"
};

// Se definen los tiempos simulados para las verificaciones
const TIEMPOS = {
    CORREO: 1800,      // 18 segundos
    DOCUMENTO: 1200,   // 12 segundos
    DISPONIBILIDAD: 2500 // 25 segundos (el cuello de botella)
};

// Se inicializa el tiempo de inicio total del programa
const tiempoInicioGlobal = Date.now();

// --- FUNCIÓN BASE DE VERIFICACIÓN ASÍNCRONA ---
function verificar(nombreVerificacion, tiempo, debeFallar = false) {
    // Se retorna la Promesa
    return new Promise((resolve, reject) => {
        // Se utiliza setTimeout para simular el tiempo de respuesta del servicio
        setTimeout(() => {
            // Se simula la lógica de fallo.
            if (debeFallar) {
                // Si debe fallar se rechaza la promesa
                reject(new Error(`[FALLO] ${nombreVerificacion} El servicio externo devolvió un error`));
            } else {
                // Si tiene éxito se resuelve la Promesa
                resolve({
                    verificacion: nombreVerificacion,
                    estado: "OK",
                    mensaje: `${nombreVerificacion} completada con éxito`
                });
            }
        }, tiempo);
    });
}

// --- FUNCIONES DE VERIFICACIÓN ESPECÍFICAS ---
// Se crean funciones simples que llaman a la función base con sus parámetros
const validarCorreo = () => {
    // Se simula que el correo se valida en 1800 ms
    return verificar("Validar Correo", TIEMPOS.CORREO);
};

const validarDocumento = () => {
    // Se simula que el documento se valida en 1200 ms
    return verificar("Validar Documento", TIEMPOS.DOCUMENTO);
};

const validarDisponibilidad = () => {
    // Se simula que la disponibilidad se valida en 2500 ms
    // Se puede cambiar el último parametro a true para probar el fallo
    return verificar("Validar Disponibilidad", TIEMPOS.DISPONIBILIDAD);
};


// --- FUNCIÓN PRINCIPAL ASYNC AWAIT Y PROMISEALL ---
async function validarFormulario() {
    console.log(`[INICIO] Iniciando validación del formulario de ${datosFormulario.nombre} a las ${getTiempoActual()}`);
    console.log("Las tres verificaciones se inician en paralelo");

    // Se crea un array de Promesas con las tres funciones de verificación
    const promesasDeValidacion = [
        validarCorreo(),
        validarDocumento(),
        validarDisponibilidad()
    ];

    try {
        // Bloque Try Se usa Promiseall para esperar a que todas las promesas finalicen
        // Promiseall solo se resuelve si TODAS las promesas se resuelven
        // Si una sola falla, el control salta inmediatamente al bloque catch
        const resultadosIndividuales = await Promise.all(promesasDeValidacion); 

        // Si se llega a este punto significa que TODAS las validaciones fueron exitosas
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;
        
        // --- DATOS DE SALIDA ÉXITO ---
        console.log("\n----- RESULTADO FINAL VALIDACIÓN EXITOSA -----");
        console.table(resultadosIndividuales);
        console.log("RESULTADO FINAL Formulario validado");
        console.log(`TIEMPO TOTAL DEL PROCESO ${tiempoTotal} segundos`);
        console.log("ANALISIS El tiempo total es determinado por la tarea mas lenta Validar Disponibilidad 25 segundos");

    } catch (error) {
        // Bloque Catch Se ejecuta si alguna de las promesas dentro de Promiseall falla
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;

        // --- DATOS DE SALIDA FALLO ---
        console.log("\n----- RESULTADO FINAL VALIDACIÓN FALLIDA -----");
        console.log("RESULTADO FINAL Validación fallida");
        // Se muestra el error de la primera promesa que falló
        console.error(`ERROR CAPTURADO ${error.message}`);
        console.log("Se detuvo el proceso porque una validación falló");
        console.log(`TIEMPO TOTAL DEL PROCESO ${tiempoTotal} segundos`);
    }
}

// --- FUNCIONES AUXILIARES ---
// Se define una función auxiliar para obtener el tiempo actual en formato legible
function getTiempoActual() {
    // Retorna la hora actual en un formato de cadena
    return new Date().toLocaleTimeString();
}
// Se llama a la función principal para iniciar la validación
validarFormulario();