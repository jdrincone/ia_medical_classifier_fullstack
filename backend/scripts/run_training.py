"""Script para ejecutar el pipeline de entrenamiento del modelo."""
import sys
from pathlib import Path

# Añadir el directorio raíz al path para que se puedan importar los módulos
sys.path.append(str(Path(__file__).parent.parent))

from core.trainer import ModelTrainer
from data_processing import load_and_preprocess_data


def main():
    """Función principal para orquestar el entrenamiento."""
    print("--- Iniciando Pipeline de Entrenamiento ---")
    df = load_and_preprocess_data()
    if not df.empty:
        trainer = ModelTrainer()
        trainer.train(df)
    print("--- Pipeline de Entrenamiento Finalizado ---")


if __name__ == "__main__":
    main()