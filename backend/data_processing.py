"""Funciones para la carga y preprocesamiento de los datos."""
import pandas as pd
from config import DATA_PATH


def load_and_preprocess_data(file_path=DATA_PATH):
    """
    Carga los datos desde un CSV, combina columnas y maneja valores nulos.

    Args:
        file_path (Path, optional): Ruta al archivo de datos.
                                    Defaults to DATA_PATH.

    Returns:
        pd.DataFrame: DataFrame procesado y limpio.
    """
    print(f"Cargando y preprocesando datos desde: {file_path}")
    try:
        df = pd.read_csv(file_path, delimiter=';')
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo de datos en {file_path}")
        return pd.DataFrame()

    df['text'] = df['title'].fillna('') + ' ' + df['abstract'].fillna('')
    df.dropna(subset=['group', 'text'], inplace=True)
    df = df[df['text'].str.strip() != '']
    df['group_list'] = df['group'].apply(lambda x: str(x).split('|'))

    print(f"Datos cargados: {len(df)} filas.")
    return df