# IA Medical Classifier Fullstack

## Descripción del Proyecto

Sistema completo de clasificación médica basado en Inteligencia Artificial que combina un backend en Python con FastAPI y un frontend en Next.js. La aplicación permite clasificar automáticamente textos médicos utilizando un modelo de machine learning entrenado.

## Características Principales

- **Backend**: API REST con FastAPI para procesamiento y predicciones
- **Frontend**: Interfaz web moderna con Next.js, TypeScript y Tailwind CSS
- **ML**: Modelo de clasificación automática de textos médicos
- **Aprendizaje Activo**: Sistema de retraining continuo para mejorar el modelo

## Estructura del Proyecto

```
ia_medical_classifier_fullstack/
├── backend/                 # API y lógica de ML
│   ├── api/                # Endpoints FastAPI
│   ├── core/               # Lógica de predicción y entrenamiento
│   ├── scripts/            # Scripts de entrenamiento
│   └── artifacts/          # Modelos entrenados
               # Aplicación web Next.js
├── app/                # Páginas y componentes
├── components/         # Componentes UI reutilizables
└── types/              # Definiciones TypeScript
```

## Requisitos Previos

- **Python 3.11+**
- **Node.js 18+**
- **Git**

## Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jdrincone/ia_medical_classifier_fullstack.git
cd ia_medical_classifier_fullstack
```

### 2. Configurar el Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

### 4. Ejecutar la Aplicación

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd ia_medical_classifier_fullstack
npm run dev
```

### 5. Acceder a la Aplicación
#### Local
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

#### Produccción
- **Frontend**: [v0-ia-medical-classifier-fullstack.vercel.app](https://v0-ia-medical-classifier-fullstack.vercel.app/)
- **Backend API**: https://clasificador-medico-api-zyod.onrender.com
- **Documentación API**: https://clasificador-medico-api-zyod.onrender.com/docs

## Uso

1. Abre la aplicación en tu navegador
2. Ingresa el texto médico que deseas clasificar
3. El sistema procesará el texto y mostrará la clasificación
4. Opcionalmente, puedes proporcionar feedback para mejorar el modelo

## Tecnologías Utilizadas

- **Backend**: Python, FastAPI, Scikit-learn, Pandas
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **ML**: Modelos de clasificación de texto
- **Deployment**: Preparado para Docker y servicios cloud

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
