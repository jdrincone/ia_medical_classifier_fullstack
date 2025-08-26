"""Modelos Pydantic (schemas) para la validación de datos en la API."""
from typing import List

from pydantic import BaseModel


class ArticlePayload(BaseModel):
    """Payload de entrada para una solicitud de predicción."""
    title: str
    abstract: str


class PredictionResponse(BaseModel):
    """Respuesta de una predicción exitosa."""
    labels: List[str]
    confidences: List[float]
    is_low_confidence: bool