# backend/core/trainer.py

import joblib
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import (classification_report, multilabel_confusion_matrix,
                             precision_recall_curve, roc_curve, roc_auc_score)
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

from config import (
    CLASSIFIER_PATH, EMBEDDING_MODEL_NAME, EVALUATION_MATRICES_PATH,
    LABEL_BINARIZER_PATH, RANDOM_STATE, TEST_SIZE
)


class ModelTrainer:
    """Encapsula el pipeline de entrenamiento y evaluación avanzada."""

    def __init__(self):
        """Inicializa el trainer."""
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.mlb = MultiLabelBinarizer()

    def _generate_embeddings(self, texts: pd.Series):
        """Genera embeddings para una serie de textos."""
        return self.embedding_model.encode(texts.tolist(), show_progress_bar=True)

    def train(self, df: pd.DataFrame):
        """Ejecuta el pipeline completo de entrenamiento y evaluación."""
        print("Iniciando el proceso de entrenamiento...")

        y = self.mlb.fit_transform(df['group_list'])
        X = df['text']
        joblib.dump(self.mlb, LABEL_BINARIZER_PATH)
        print(f"Clases: {list(self.mlb.classes_)}")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
        )

        print("Generando embeddings...")
        X_train_embeddings = self._generate_embeddings(X_train)
        X_test_embeddings = self._generate_embeddings(X_test)

        print("Entrenando el clasificador...")
        classifier = OneVsRestClassifier(SGDClassifier(
            random_state=RANDOM_STATE, loss='log_loss',
            alpha=1e-4, class_weight='balanced'
        ))
        classifier.fit(X_train_embeddings, y_train)
        joblib.dump(classifier, CLASSIFIER_PATH)
        print("Clasificador guardado.")

        # --- Evaluación Avanzada ---
        print("Realizando evaluación avanzada...")
        # Predicciones en ambos conjuntos (train y test)
        y_pred_train = classifier.predict(X_train_embeddings)
        y_pred_test = classifier.predict(X_test_embeddings)
        y_prob_test = classifier.predict_proba(X_test_embeddings)

        # 1. Reportes de clasificación para train y test (detectar overfitting)
        train_report = classification_report(
            y_train, y_pred_train, target_names=self.mlb.classes_,
            output_dict=True, zero_division=0
        )
        test_report = classification_report(
            y_test, y_pred_test, target_names=self.mlb.classes_,
            output_dict=True, zero_division=0
        )

        # 2. Matrices de confusión (una por cada clase)
        conf_matrices = multilabel_confusion_matrix(y_test, y_pred_test)

        # 3. Datos para curvas Precision-Recall y ROC
        curves_data = {}
        for i, class_name in enumerate(self.mlb.classes_):
            precision, recall, _ = precision_recall_curve(y_test[:, i], y_prob_test[:, i])
            fpr, tpr, _ = roc_curve(y_test[:, i], y_prob_test[:, i])
            auc_score = roc_auc_score(y_test[:, i], y_prob_test[:, i])
            curves_data[class_name] = {
                "precision_recall_curve": {"precision": precision.tolist(), "recall": recall.tolist()},
                "roc_curve": {"fpr": fpr.tolist(), "tpr": tpr.tolist()},
                "auc_score": auc_score
            }

        # Guardar todos los artefactos de evaluación en un solo archivo
        evaluation_artifacts = {
            "train_report": train_report,
            "test_report": test_report,
            "confusion_matrices": conf_matrices.tolist(),
            "curves_data": curves_data,
            "class_names": self.mlb.classes_.tolist()
        }
        joblib.dump(evaluation_artifacts, EVALUATION_MATRICES_PATH)
        print("Artefactos de evaluación avanzada guardados.")