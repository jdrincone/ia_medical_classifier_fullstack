"""
Script para re-entrenar el modelo incorporando nuevas correcciones
del bucle de aprendizaje activo.
"""
import sys
import os
import pandas as pd
from pathlib import Path

# Añadir el directorio raíz al path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from core.trainer import ModelTrainer
from config import DATA_PATH, CORRECTIONS_PATH


def main():
    """Función principal para orquestar el re-entrenamiento."""
    print("--- Iniciando Pipeline de Re-entrenamiento ---")

    if not CORRECTIONS_PATH.exists():
        print("No se encontró 'corrections.csv'. Re-entrenamiento omitido.")
        return

    # Cargar datos originales y correcciones
    df_original = pd.read_csv(DATA_PATH, delimiter=';')
    df_corrections = pd.read_csv(CORRECTIONS_PATH, delimiter=';')
    print(f"Se encontraron {len(df_corrections)} nuevas muestras corregidas.")

    # Combinar, eliminar duplicados y guardar
    df_combined = pd.concat([df_original, df_corrections], ignore_index=True)
    df_combined.drop_duplicates(subset=['title', 'abstract'], keep='last', inplace=True)

    # Renombrar el archivo de correcciones para evitar su reutilización
    processed_corrections_path = CORRECTIONS_PATH.with_suffix('.csv.processed')
    os.rename(CORRECTIONS_PATH, processed_corrections_path)
    print(f"Archivo de correcciones renombrado a: {processed_corrections_path.name}")

    # Re-entrenar con el dataset combinado
    trainer = ModelTrainer()
    trainer.train(df_combined)

    print("--- Pipeline de Re-entrenamiento Finalizado ---")


if __name__ == "__main__":
    main()