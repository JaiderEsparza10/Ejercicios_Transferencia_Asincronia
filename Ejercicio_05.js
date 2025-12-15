// Mensaje inicial del programa
console.log("----- 5 INTEGRACIÓN DE SERVICIOS AVANZADA -----");

// --- DATOS DE ENTRADA Y CONFIGURACIÓN ---
const userID = 998;

// Se definen los tiempos simulados para cada servicio
const TIEMPOS = {
    SERVICIO_A_DISPONIBILIDAD: 1000, // 10 segundos
    SERVICIO_B_DATOS: 1500,          // 15 segundos
    SERVICIO_C_HISTORIAL: 2500,      // 25 segundos (el cuello de botella en paralelo)
    SERVICIO_D_RECOMENDACIONES: 1200 // 12 segundos
};

// Se utiliza esta bandera para probar el manejo de errores
// Se puede cambiar a true para simular un fallo en el Servicio C
const DEBE_FALLAR_C = false;

// Se inicializa el tiempo de inicio total del programa
const tiempoInicioGlobal = Date.now();
// Se utiliza un objeto para almacenar el informe central unificado
let informeCentral = {};

// --- FUNCIÓN BASE DE SERVICIO ASÍNCRONO ---
function simularServicio(nombreServicio, tiempo, resultadoSimulado, debeFallar = false) {
    // Se registra el inicio del servicio
    console.log(`[Servicio - ${getTiempoRelativo()}s] ${nombreServicio} Iniciando`);
    
    // Se retorna la Promesa
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (debeFallar) {
                // Si debe fallar se rechaza la promesa con un error
                reject(new Error(`Servicio ${nombreServicio} FALLÓ No se pudo conectar`));
            } else {
                // Si tiene éxito se resuelve la Promesa
                resolve({
                    servicio: nombreServicio,
                    estado: "OK",
                    datos: resultadoSimulado,
                    tiempoFinalizacion: getTiempoRelativo()
                });
            }
        }, tiempo);
    });
}

// --- FUNCIONES DE SERVICIOS ESPECÍFICOS ---
const servicioA_Disponibilidad = () => {
    // Se simula la consulta de disponibilidad
    return simularServicio("A Disponibilidad", TIEMPOS.SERVICIO_A_DISPONIBILIDAD, { disponible: true });
};

const servicioB_Datos = () => {
    // Se simula la consulta de datos del usuario
    return simularServicio("B Datos del Usuario", TIEMPOS.SERVICIO_B_DATOS, { nombre: "Juan Perez", email: "juperez@ejemplo" });
};

const servicioC_Historial = () => {
    // Se simula la consulta de historial de acciones
    // Se usa la bandera DEBE_FALLAR_C para inyectar el error
    return simularServicio("C Historial de Acciones", TIEMPOS.SERVICIO_C_HISTORIAL, { compras: 15, vistas: 450 }, DEBE_FALLAR_C);
};

// Este servicio depende de los resultados de B y C
const servicioD_Recomendaciones = (datosB, datosC) => {
    // Se registra que el servicio D ha iniciado con datos previos
    console.log(`[Servicio - ${getTiempoRelativo()}s] D Recomendaciones Iniciando Depende de B y C`);
    const recomendacion = datosC.compras > 10 ? "Producto Premium" : "Producto Básico";
    // Se simula el tiempo del servicio D
    return simularPaso(`D Recomendaciones para ${datosB.nombre}`, TIEMPOS.SERVICIO_D_RECOMENDACIONES, { recomendacion });
};

// --- FUNCIÓN PRINCIPAL ASYNC AWAIT Y FLUJO DE INTEGRACIÓN ---
async function integrarServicios() {
    console.log(`[INICIO] Integrando servicios para el Usuario ID ${userID} a las ${getTiempoActual()}`);

    try {
        // --- FASE 1 EJECUCIÓN PARALELA (Servicios A B y C) ---
        console.log("\n[FASE 1 - PARALELO] Ejecutando Servicios A B y C simultaneamente");

        // Se usa Promiseall para iniciar A B y C al mismo tiempo
        // El 'await' solo continuará cuando el servicio más lento Servicio C 25 segundos termine
        const [resultadoA, resultadoB, resultadoC] = await Promise.all([
            servicioA_Disponibilidad(),
            servicioB_Datos(),
            servicioC_Historial()
        ]); 

        // Se registran los resultados de la Fase 1
        informeCentral.A = resultadoA;
        informeCentral.B = resultadoB;
        informeCentral.C = resultadoC;

        // Se extraen los datos necesarios para el siguiente paso
        const datosUsuario = resultadoB.datos;
        const datosHistorial = resultadoC.datos;

        // --- FASE 2 EJECUCIÓN SECUENCIAL (Servicio D) ---
        console.log("\n[FASE 2 - SECUENCIAL] Iniciando Servicio D con datos de B y C");
        // El servicio D se ejecuta solo después de que B y C hayan terminado y sus resultados estén disponibles
        const resultadoD = await servicioD_Recomendaciones(datosUsuario, datosHistorial);
        informeCentral.D = resultadoD;
        // --- DATOS DE SALIDA ÉXITO ---
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;
        console.log("\n----- RESULTADO FINAL INTEGRACIÓN EXITOSA -----");
        console.log("ESTADO GENERAL DEL SISTEMA Integración exitosa");
        console.log("INFORME CENTRAL DETALLADO");
        console.table(Object.values(informeCentral).map(r => ({
            Servicio: r.servicio,
            Estado: r.estado,
            Datos: JSON.stringify(r.datos),
            Finalizado_en_segundos: r.tiempoFinalizacion || r.duracion
        })));
        console.log(`ORDEN REAL DE FINALIZACIÓN Primero A luego B y C D termina al final`);
        console.log(`TIEMPO TOTAL DEL PROCESO ${tiempoTotal} segundos`);
        // Analisis de tiempos
        console.log("ANALISIS La duración total es 25 segundos el tiempo del Servicio C mas 12 segundos el tiempo del Servicio D");
        console.log("Total teorico 25 segundos 12 segundos = 37 segundos");
    } catch (error) {
        // Bloque Catch Se ejecuta si alguna de las promesas falla
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;
        // --- DATOS DE SALIDA FALLO ---
        console.log("\n----- RESULTADO FINAL INTEGRACIÓN FALLIDA -----");
        console.log("ESTADO GENERAL DEL SISTEMA Error general");
        console.error(`ERROR CAPTURADO ${error.message}`);
        console.log("El proceso se detuvo porque un servicio esencial falló");
        console.log(`TIEMPO TOTAL DEL PROCESO hasta el fallo ${tiempoTotal} segundos`);
    }
}

// --- FUNCIONES AUXILIARES ---
// Se define una función auxiliar para obtener el tiempo actual en formato legible
function getTiempoActual() {
    // Retorna la hora actual en un formato de cadena
    return new Date().toLocaleTimeString();
}
// Se define una función auxiliar para obtener el tiempo transcurrido desde el inicio
function getTiempoRelativo() {
    // Se calcula el tiempo transcurrido en segundos
    return (Date.now() - tiempoInicioGlobal) / 1000;
}
// Se define una función simple para el servicio D sin complejidad extra de Promesa
function simularPaso(nombre, tiempo, resultadoSimulado) {
    // Se retorna la Promesa
    return new Promise((resolve) => {
        setTimeout(() => {
            // Se resuelve la Promesa
            resolve({
                servicio: nombre,
                estado: "Completado",
                datos: resultadoSimulado,
                duracion: tiempo / 1000,
                tiempoFinalizacion: getTiempoRelativo()
            });
        }, tiempo);
    });
}
// Se llama a la función principal para iniciar la integración
integrarServicios();