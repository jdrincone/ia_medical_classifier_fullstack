"""
Módulo para realizar el Análisis Exploratorio de Datos (EDA).
"""
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer


def generate_eda_report(df: pd.DataFrame):
    """
    Genera un reporte completo del Análisis Exploratorio de Datos.

    Analiza un DataFrame preprocesado para extraer estadísticas generales,
    la distribución de etiquetas, la co-ocurrencia de etiquetas y la
    distribución de la longitud de los abstracts.

    Args:
        df (pd.DataFrame): El DataFrame que ya ha sido preprocesado.

    Returns:
        dict: Un diccionario anidado con todas las estadísticas y datos
              para ser consumido por la API y visualizado en el frontend.
    """
    # --- 1. Estadísticas Generales ---
    total_articles = len(df)
    df['abstract_length'] = df['abstract'].fillna('').str.len()
    avg_abstract_length = df['abstract_length'].mean()

    # --- 2. Análisis de Etiquetas (Distribución) ---
    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(df['group_list'])
    label_names = mlb.classes_
    label_counts = pd.DataFrame(y, columns=label_names).sum().to_dict()

    # --- 3. Matriz de Co-ocurrencia de Etiquetas ---
    # Esto nos ayuda a entender qué tan a menudo aparecen juntas las etiquetas.
    # Por ejemplo, ¿cuántos artículos son tanto 'Cardiovascular' como 'Neurológico'?
    df_labels = pd.DataFrame(y, columns=label_names)
    co_occurrence_matrix = df_labels.T.dot(df_labels)

    # --- 4. Distribución de Longitud de Abstracts ---
    # Agrupamos la longitud de los abstracts en rangos para una mejor visualización.
    bins = [0, 500, 1000, 1500, 2000, 3000, float('inf')]
    labels = [
        "0-500", "501-1000", "1001-1500", "1501-2000",
        "2001-3000", "3000+"
    ]
    df['length_bin'] = pd.cut(
        df['abstract_length'], bins=bins, labels=labels, right=False
    )
    length_distribution = df['length_bin'].value_counts().sort_index().to_dict()

    # --- 5. Ensamblaje del Reporte Final ---
    # Creamos el diccionario que será devuelto como JSON por la API.
    report = {
        "general_stats": {
            "total_articles": total_articles,
            "avg_abstract_length": int(avg_abstract_length),
            "total_unique_labels": len(label_names)
        },
        "label_distribution": label_counts,
        "co_occurrence_matrix": co_occurrence_matrix.to_dict(),
        "length_distribution": length_distribution
    }

    return report