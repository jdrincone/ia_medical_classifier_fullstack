

La siguiente quiea fue creada usando Gemini


Guía de Prompts para Recrear el Dashboard en v0
Sigue estos pasos en orden. Cada prompt construye una parte de la aplicación, basándose en el anterior.

Contexto Esencial para v0: El Backend
Información Clave: Toda la aplicación se conectará a un backend de FastAPI que ya está desplegado y funcionando.

URL Base de la API: https://clasificador-medico-api-zyod.onrender.com

Documentación de Endpoints: https://clasificador-medico-api-zyod.onrender.com/docs

Todos los fetch (peticiones de datos) deben apuntar a esta URL base.

Prompt 1: Estructura Principal y Lógica de Datos Inicial
Este primer prompt crea el esqueleto de la aplicación y la lógica para cargar los datos que se usarán en varias páginas.

Crea un dashboard con un layout de dos columnas.

La columna izquierda será una barra de navegación lateral fija de 280px de ancho con fondo gris claro. En la parte superior, incluye un título con un ícono de portapapeles (ClipboardIcon) y el texto "Clasificador Médico IA". Debajo, crea una lista de botones de navegación: "Resumen", "Análisis Exploratorio", "Demo", "Métricas del Modelo" y "Cómo Funciona". El botón activo debe tener un fondo más oscuro.

La columna derecha será el área de contenido principal.

Lógica Principal: Usa useState y useEffect para que, en cuanto se cargue el componente, se hagan dos peticiones fetch al backend:

A [URL_BASE]/exploratory-data-analysis para obtener los datos del EDA.

A [URL_BASE]/evaluation-artifacts para obtener las métricas del modelo.

Almacena los resultados en estados separados y maneja los estados de carga.

Prompt 2: Página de "Resumen"
Con la estructura ya creada, este prompt se enfoca en llenar el área de contenido con la página de resumen estática.

En el área de contenido principal, crea la página de "Resumen".

Debe tener un título principal "Resumen del Proyecto".

Debajo, crea una Card principal con el título "Clasificador Médico con Inteligencia Artificial". El contenido debe explicar que la herramienta clasifica artículos médicos y mostrar 4 Badges con borde para las categorías: "❤️ Cardiovascular", "🧠 Neurológica", "🫘 Hepatorrenal" y "🎗️ Oncológica".

Dentro de esa misma Card, añade una sección resaltada con un borde izquierdo de color esmeralda y un fondo más claro, con el subtítulo "Objetivo Principal" y un párrafo explicativo.

Finalmente, debajo de la Card principal, añade una segunda Card para la "Información del Desarrollador". Debe mostrar el nombre "Juan David Rincón", su título, y dos enlaces estilizados como botones: uno para el email (jdrincone@gmail.com) y otro para el repositorio de GitHub.

Prompt 3: Página de "Demo Interactiva"
Este prompt construye el formulario y la lógica para probar el modelo en tiempo real.

Ahora, crea el contenido para la página "Demo Interactiva".

El título principal será "Demo Interactiva".

Debajo, crea una Card con el título "Clasificar un Nuevo Artículo". Dentro, incluye un Input para el "Título del Artículo" y una Textarea de 8 filas para el "Abstract del Artículo".

Añade un botón grande de color esmeralda que ocupe todo el ancho con el texto "Clasificar Artículo". Al hacer clic en este botón, se debe enviar una petición POST con el título y el abstract al endpoint [URL_BASE]/predict.

Debajo de la Card del formulario, diseña la sección de resultados. Debe mostrar una "PredictionResultCard" por cada predicción recibida de la API. Esta card debe tener:

El nombre de la categoría como título.

Un subtítulo que indique el nivel de confianza ("Confianza Alta", "Moderada", "Baja") con un color distintivo.

Una barra de progreso (Progress) que refleje el porcentaje de confianza.

Una sección de "Posibles Palabras Clave Influyentes" con Badges.

Prompt 4: Página de "Métricas del Modelo" y "Análisis Exploratorio"
Esta es la página más densa en visualización de datos. El prompt le indica a v0 que use los datos que ya se cargaron en el primer paso.

Crea el contenido para las páginas de visualización de datos. Usa los datos obtenidos de la API en el Prompt 1 para rellenar estas secciones.

Para la página "Métricas del Modelo":

Muestra una fila con tres Cards de estadísticas: "F1-Score (Prueba)", "Número de Clases", y "Modelo Base", usando los datos de evaluation-artifacts.

Debajo, crea una Card grande "Análisis de Sobreajuste (Overfitting)". Dentro, usa Recharts para crear un gráfico de barras (BarChart) que compare el F1-Score de "Entrenamiento" y "Prueba".

Finalmente, añade otra Card "Análisis por Categoría" con un desplegable (Select) para elegir una categoría, una visualización de la Matriz de Confusión y un gráfico de líneas (LineChart) para la Curva ROC.

Para la página "Análisis Exploratorio":

Muestra tres cards con las estadísticas generales (Total de artículos, longitud promedio, etc.) del endpoint exploratory-data-analysis.

Crea un gráfico de barras para la "Distribución de Etiquetas" y un gráfico de pastel (PieChart) para la "Distribución de Longitud".

Prompt 5: Integración y Toques Finales
Este último prompt es para refinar y asegurar que todo se vea cohesivo.

Revisa todo el dashboard. Asegúrate de que el espaciado entre los elementos sea consistente. El tema de color principal es el esmeralda para los elementos de éxito y botones de acción. Los gráficos deben ser responsivos. La transición entre las páginas al hacer clic en la navegación debe ser instantánea, mostrando solo el contenido de la página activa. Utiliza la fuente Inter para todo el texto.