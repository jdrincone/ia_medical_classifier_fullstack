# backend/core/predictor.py (Corregido para ignorar el warning)

"""
Módulo que contiene la clase Predictor para realizar inferencias
cargando los artefactos del modelo entrenado.
"""
import warnings
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
# Importamos específicamente la advertencia que queremos ignorar
from sklearn.base import InconsistentVersionWarning

from config import (
    CLASSIFIER_PATH, LABEL_BINARIZER_PATH, EMBEDDING_MODEL_NAME,
    PREDICTION_THRESHOLD
)

# ¡NUEVO! Filtramos la advertencia específica de inconsistencia de versiones
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)


class Predictor:
    """Encapsula la carga de modelos y la lógica de predicción."""

    def __init__(self):
        """Carga todos los artefactos necesarios para la predicción."""
        self.model = None
        self.mlb = None
        self.embedding_model = None
        try:
            # Ahora, cuando joblib.load se ejecute, el warning será suprimido
            self.model = joblib.load(CLASSIFIER_PATH)
            self.mlb = joblib.load(LABEL_BINARIZER_PATH)
            self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            print("Predictor inicializado y artefactos cargados correctamente.")
        except FileNotFoundError:
            print("Advertencia: No se encontraron los artefactos del modelo.")
            print("Por favor, ejecuta el script de entrenamiento primero.")

    def is_ready(self) -> bool:
        """Verifica si todos los componentes del modelo están cargados."""
        return all([self.model, self.mlb, self.embedding_model])

    def predict(self, title: str, abstract: str) -> tuple[list, list, bool]:
        """
        Realiza una predicción para un nuevo artículo.

        Returns:
            Una tupla (etiquetas, confianzas, es_baja_confianza).
        """
        if not self.is_ready():
            return ["Error: el modelo no está cargado"], [], False

        text = f"{title} {abstract}"
        embedding = self.embedding_model.encode([text])
        probabilities = self.model.predict_proba(embedding)[0]

        is_low_confidence = np.any((probabilities > 0.3) & (probabilities < 0.7))
        predicted_indices = np.where(probabilities > PREDICTION_THRESHOLD)[0]

        if predicted_indices.size == 0:
            return [], [], is_low_confidence

        labels = self.mlb.classes_[predicted_indices]
        confidences = probabilities[predicted_indices]

        return list(labels), list(confidences), is_low_confidence