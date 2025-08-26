// frontend/types/index.ts

/**
 * Define la estructura de la respuesta de una predicción individual
 * desde el endpoint /predict.
 */
export interface Prediction {
    labels: string[];
    confidences: number[];
    is_low_confidence: boolean;
  }
  
  /**
   * Define la estructura de la respuesta completa de los artefactos
   * de evaluación desde el endpoint /evaluation-artifacts.
   */
  export interface EvaluationArtifacts {
    train_report: PerformanceReport;
    test_report: PerformanceReport;
    confusion_matrices: number[][][]; // Array de matrices 2x2
    curves_data: {
      [key: string]: {
        precision_recall_curve: {
          precision: number[];
          recall: number[];
        };
        roc_curve: {
          fpr: number[];
          tpr: number[];
        };
        auc_score: number;
      };
    };
    class_names: string[];
  }
  
  /**
   * Define la estructura de un reporte de clasificación individual
   * (usado dentro de EvaluationArtifacts).
   */
  export interface PerformanceReport {
    [key: string]: {
      precision: number;
      recall: number;
      'f1-score': number;
      support: number;
    };
  }
  
  /**
   * Define la estructura del reporte del Análisis Exploratorio de Datos (EDA)
   * desde el endpoint /exploratory-data-analysis.
   */
  export interface EdaData {
    general_stats: {
      total_articles: number;
      avg_abstract_length: number;
      total_unique_labels: number;
    };
    label_distribution: {
      [key: string]: number;
    };
    co_occurrence_matrix: {
      [key: string]: {
        [key: string]: number;
      };
    };
    length_distribution: {
      [key: string]: number;
    };
  }
