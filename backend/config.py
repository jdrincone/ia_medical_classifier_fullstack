"""Módulo de configuración central para todo el proyecto."""
from pathlib import Path

# --- Rutas del Proyecto ---
BASE_DIR = Path(__file__).parent.resolve()
ARTIFACTS_PATH = BASE_DIR / "artifacts"
DATA_PATH = BASE_DIR / "challenge_data-18-ago.csv"
CORRECTIONS_PATH = BASE_DIR / "corrections.csv"

# Crear directorios necesarios si no existen
ARTIFACTS_PATH.mkdir(parents=True, exist_ok=True)

# --- Rutas de Artefactos del Modelo ---
CLASSIFIER_PATH = ARTIFACTS_PATH / "classifier.pkl"
LABEL_BINARIZER_PATH = ARTIFACTS_PATH / "label_binarizer.pkl"
EVALUATION_MATRICES_PATH = ARTIFACTS_PATH / "evaluation_matrices.pkl"
TEST_EXAMPLES_PATH = ARTIFACTS_PATH / "test_examples.pkl"

# --- Parámetros del Modelo de IA ---
# Para mayor precisión médica, investiga modelos como "emilyalsentzer/Bio_ClinicalBERT"
EMBEDDING_MODEL_NAME = 'all-MiniLM-L6-v2'
TEST_SIZE = 0.2
RANDOM_STATE = 42
PREDICTION_THRESHOLD = 0.5  # Umbral de confianza para una predicción positiva