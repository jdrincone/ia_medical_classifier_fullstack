# backend/api/main.py (Versión Mejorada y Robusta)

"""Punto de entrada principal para la aplicación de la API FastAPI."""
from typing import Dict, Any
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import classification_report

from data_processing import load_and_preprocess_data
from core.eda import generate_eda_report
from api.schemas import ArticlePayload, PredictionResponse
from core.predictor import Predictor
import config

# --- Inicialización de la App y el Modelo ---
app = FastAPI(
    title="API del Clasificador Médico",
    description="Una API para clasificar artículos médicos usando LLM Embeddings.",
    version="1.0.0"
)
predictor = Predictor()

# --- Middlewares ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Endpoints ---
@app.get("/", tags=["General"])
def read_root():
    """Endpoint raíz para verificar el estado de la API."""
    return {"status": "ok", "message": "API del Clasificador Médico en funcionamiento"}


@app.post("/predict", response_model=PredictionResponse, tags=["Machine Learning"])
def predict_article(payload: ArticlePayload):
    """Recibe un artículo y devuelve las etiquetas predichas."""
    if not predictor.is_ready():
        raise HTTPException(
            status_code=503,
            detail="El modelo no está cargado. Ejecuta el entrenamiento."
        )
    labels, confs, low_conf = predictor.predict(payload.title, payload.abstract)
    return {
        "labels": labels, "confidences": confs, "is_low_confidence": low_conf
    }


@app.get("/performance-report", tags=["Machine Learning"])
def get_performance_report() -> Dict[str, Any]:
    """Devuelve el reporte de clasificación del modelo."""
    try:
        # Cargar los artefactos necesarios una sola vez
        eval_data = joblib.load(config.EVALUATION_MATRICES_PATH)
        mlb = joblib.load(config.LABEL_BINARIZER_PATH)
        y_test = eval_data['y_test']
        y_pred = eval_data['y_pred']

        report = classification_report(
            y_test, y_pred, target_names=mlb.classes_,
            output_dict=True, zero_division=0
        )
        return report
    except FileNotFoundError:
        # Error claro si los artefactos no existen
        raise HTTPException(
            status_code=404,
            detail="Artefactos de evaluación no encontrados. Ejecuta `scripts/run_training.py` primero."
        )
    except Exception as e:
        # Captura cualquier otro error inesperado
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")

@app.get("/exploratory-data-analysis", tags=["Data Analysis"])
def get_eda_report() -> Dict[str, Any]:
    """
    Realiza y devuelve un reporte del Análisis Exploratorio de Datos (EDA).
    """
    try:
        # Cargamos los datos crudos para el análisis
        df = load_and_preprocess_data()
        if df.empty:
            raise HTTPException(status_code=404, detail="Dataset no encontrado.")

        report = generate_eda_report(df)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")

@app.get("/evaluation-artifacts", tags=["Machine Learning"])
def get_evaluation_artifacts() -> Dict[str, Any]:
    """
    Devuelve un diccionario con todos los artefactos de evaluación del modelo
    (reportes, matrices de confusión, datos de curvas, etc.).
    """
    try:
        artifacts = joblib.load(config.EVALUATION_MATRICES_PATH)
        return artifacts
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Artefactos de evaluación no encontrados. Ejecuta `scripts/run_training.py` primero."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")
