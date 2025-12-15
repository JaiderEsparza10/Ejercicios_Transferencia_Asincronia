// Mensaje inicial del programa
console.log("----- 4 PROCESAMIENTO DE PEDIDOS CON PASOS OBLIGATORIOS Y OPCIONALES -----");
// --- DATOS DE ENTRADA Y CONFIGURACIÓN ---
const pedidoID = "ORD-456";
// Tiempos simulados para los procesos
const TIEMPOS = {
    VALIDAR_STOCK: 1500,        // 15 segundos
    CALCULAR_COSTOS: 2000,      // 20 segundos
    RECOMENDACION: 800,         // 08 segundos 
    ENVIAR_FACTURA: 1000        // 10 segundo
};
// Se inicializa el tiempo de inicio total del programa
const tiempoInicioGlobal = Date.now();
let resultadosParciales = {};

// --- FUNCIÓN BASE DE PROCESAMIENTO ASÍNCRONO ---
function simularPaso(nombre, tiempo, debeFallar = false) {
    // Se registra el inicio del paso
    console.log(`[Paso - ${getTiempoRelativo()}s] ${nombre} Iniciando`);
    
    // Se retorna la Promesa
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (debeFallar) {
                // Si debe fallar se rechaza la promesa
                reject(new Error(`${nombre} FALLO El sistema de inventario no responde`));
            } else {
                // Si tiene éxito se resuelve la Promesa
                resolve({
                    paso: nombre,
                    estado: "Completado",
                    duracion: tiempo / 1000,
                    marcaTiempo: getTiempoRelativo()
                });
            }
        }, tiempo);
    });
}

// --- FUNCIONES DE PASOS ESPECÍFICOS ---

const validarStock = () => {
    // Es un paso obligatorio
    return simularPaso("1 Validar Stock", TIEMPOS.VALIDAR_STOCK);
};

const calcularCostos = () => {
    // Es un paso obligatorio
    return simularPaso("2 Calcular Costos Finales", TIEMPOS.CALCULAR_COSTOS);
};

const generarRecomendacion = () => {
    // Es un paso opcional
    return simularPaso("3 Generar Recomendaciones", TIEMPOS.RECOMENDACION);
};

const enviarFactura = (costos) => {
    // Es un paso obligatorio
    return simularPaso(`4 Enviar Factura Electrónica (Monto ${costos})`, TIEMPOS.ENVIAR_FACTURA);
};

// --- FUNCIÓN PRINCIPAL ASYNC AWAIT Y PROMISEALL ---
async function procesarPedido() {
    console.log(`[INICIO] Procesando Pedido ID ${pedidoID} a las ${getTiempoActual()}`);

    try {
        // --- SECUENCIA 1 PASOS OBLIGATORIOS ---
        // Se usa await para asegurar que el stock se valide antes de calcular costos
        const stockResult = await validarStock();
        resultadosParciales.stock = stockResult;

        // --- PUNTO DE RAMIFICACIÓN PARALELA ---
        console.log(`[PARALELO - ${getTiempoRelativo()}s] Iniciando Cálculo de Costos (Obligatorio) y Recomendación (Opcional) simultaneamente`);

        // Se usa Promiseall para ejecutar dos pasos a la vez
        const [costosResult, recomendacionResult] = await Promise.all([
            calcularCostos(), // Paso obligatorio B
            generarRecomendacion() // Paso opcional C
        ]); 

        resultadosParciales.costos = costosResult;
        resultadosParciales.recomendacion = recomendacionResult;

        // --- SECUENCIA 2 PASO OBLIGATORIO FINAL ---
        // Se usa await para asegurar que la factura se envíe después de tener costos
        const facturaResult = await enviarFactura(150000); // Se asume un costo
        resultadosParciales.factura = facturaResult;

        // --- DATOS DE SALIDA ÉXITO ---
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;
        
        console.log("\n----- RESULTADO FINAL PROCESO EXITOSO -----");
        console.log("PEDIDO PROCESADO con éxito");
        console.log("FLUJO REAL DE EJECUCIÓN");
        console.table(Object.values(resultadosParciales).map(r => ({
            Paso: r.paso || r.nombre,
            Estado: r.estado,
            Finalizado_en_segundos: r.marcaTiempo || r.duracion
        })));
        console.log(`Factura generada para el Pedido ID ${pedidoID}`);
        console.log(`TIEMPO TOTAL DEL PROCESO ${tiempoTotal} segundos`);
        
        // Analisis de tiempos
        console.log("ANALISIS La duración total está determinada por la suma de los pasos obligatorios secuenciales mas largos");
        console.log("El paso 3 Recomendación no añadió tiempo extra al flujo total porque se ejecutó en paralelo con el paso 2 Calcular Costos");

    } catch (error) {
        // Bloque Catch Se ejecuta si algún paso obligatorio falla
        const tiempoTotal = (Date.now() - tiempoInicioGlobal) / 1000;
        
        // --- DATOS DE SALIDA FALLO ---
        console.log("\n----- RESULTADO FINAL PROCESO FALLIDO -----");
        console.log("ERROR DEL SISTEMA Se detuvo el procesamiento del pedido");
        console.error(`DETALLE DEL ERROR ${error.message}`);
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
// Se llama a la función principal para iniciar el procesamiento
procesarPedido();