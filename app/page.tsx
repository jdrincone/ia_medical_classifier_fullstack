"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { CardTitle, CardHeader, CardContent, Card, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Prediction, EdaData, EvaluationArtifacts } from "@/types"

// --- CAMBIO: URL de la API desplegada en Render ---
// Esta es la variable global con la URL "quemada"
const API_BASE_URL = "https://clasificador-medico-api-zyod.onrender.com"

const MOCK_EDA_DATA: EdaData = {
  general_stats: {
    total_articles: 1250,
    avg_abstract_length: 1847,
    total_unique_labels: 4,
  },
  label_distribution: {
    Cardiovascular: 312,
    Neurological: 298,
    Hepatorenal: 285,
    Oncological: 355,
  },
  length_distribution: {
    "Corto (< 1000)": 156,
    "Medio (1000-2000)": 687,
    "Largo (> 2000)": 407,
  },
}

const MOCK_ARTIFACTS: EvaluationArtifacts = {
  train_report: {
    Cardiovascular: { precision: 0.92, recall: 0.89, "f1-score": 0.905 },
    Neurological: { precision: 0.88, recall: 0.91, "f1-score": 0.895 },
    Hepatorenal: { precision: 0.9, recall: 0.87, "f1-score": 0.885 },
    Oncological: { precision: 0.93, recall: 0.94, "f1-score": 0.935 },
    "weighted avg": { precision: 0.91, recall: 0.9, "f1-score": 0.905 },
  },
  test_report: {
    Cardiovascular: { precision: 0.87, recall: 0.84, "f1-score": 0.855 },
    Neurological: { precision: 0.83, recall: 0.86, "f1-score": 0.845 },
    Hepatorenal: { precision: 0.85, recall: 0.82, "f1-score": 0.835 },
    Oncological: { precision: 0.88, recall: 0.89, "f1-score": 0.885 },
    "weighted avg": { precision: 0.86, recall: 0.85, "f1-score": 0.855 },
  },
  confusion_matrices: [
    [
      [45, 8],
      [6, 41],
    ], // Cardiovascular
    [
      [42, 11],
      [9, 38],
    ], // Neurological
    [
      [44, 9],
      [7, 40],
    ], // Hepatorenal
    [
      [47, 6],
      [5, 42],
    ], // Oncological
  ],
  curves_data: {
    Cardiovascular: { roc_curve: { fpr: [0, 0.1, 0.2, 0.3, 1], tpr: [0, 0.7, 0.8, 0.9, 1] }, auc_score: 0.89 },
    Neurological: { roc_curve: { fpr: [0, 0.15, 0.25, 0.35, 1], tpr: [0, 0.65, 0.75, 0.85, 1] }, auc_score: 0.85 },
    Hepatorenal: { roc_curve: { fpr: [0, 0.12, 0.22, 0.32, 1], tpr: [0, 0.68, 0.78, 0.88, 1] }, auc_score: 0.87 },
    Oncological: { roc_curve: { fpr: [0, 0.08, 0.18, 0.28, 1], tpr: [0, 0.72, 0.82, 0.92, 1] }, auc_score: 0.91 },
  },
  class_names: ["Cardiovascular", "Neurological", "Hepatorenal", "Oncological"],
}

// --- Sub-componente para la Tarjeta de Resultado (sin cambios) ---
const PredictionResultCard = ({ label, confidence, text }: { label: string; confidence: number; text: string }) => {
  const getConfidenceStyle = (score: number) => {
    if (score > 0.85) return { level: "Confianza Alta", color: "text-emerald-500" }
    if (score > 0.6) return { level: "Confianza Moderada", color: "text-yellow-500" }
    return { level: "Confianza Baja", color: "text-orange-500" }
  }
  const style = getConfidenceStyle(confidence)
  const commonWords: { [key: string]: Set<string> } = {
    Cardiovascular: new Set(["heart", "cardiac", "blood", "vessel", "hypertension", "failure", "artery"]),
    Neurological: new Set(["brain", "neuro", "nerve", "stroke", "alzheimer", "neuron", "demyelination"]),
    Hepatorenal: new Set(["liver", "kidney", "renal", "hepatic", "dialysis", "hepatitis"]),
    Oncological: new Set(["cancer", "tumor", "chemotherapy", "oncology", "carcinoma", "metastasis"]),
  }
  const textWords = new Set(text.toLowerCase().replace(/[.,]/g, "").split(/\s+/))
  const influentialWords = Array.from(textWords).filter((word) => commonWords[label]?.has(word))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{label}</CardTitle>
        <CardDescription className={style.color}>{style.level}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-500">Confianza del Modelo</span>
            <span className={`text-lg font-bold ${style.color}`}>{(confidence * 100).toFixed(1)}%</span>
          </div>
          <Progress value={confidence * 100} className="h-3 [&>*]:bg-emerald-500" />
        </div>
        {influentialWords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Posibles Palabras Clave Influyentes</h4>
            <div className="flex flex-wrap gap-2">
              {influentialWords.slice(0, 5).map((word) => (
                <Badge key={word} variant="outline">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Componentes para cada Página ---

const ResumenPage = () => {
  return (
    <>
      <h1 className="font-semibold text-lg md:text-2xl mb-6">Resumen del Proyecto</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-emerald-600">Clasificador Médico con Inteligencia Artificial</CardTitle>
            <CardDescription>Sistema avanzado de clasificación automática de literatura médica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Esta herramienta utiliza un modelo de <strong>Inteligencia Artificial de alto rendimiento</strong> basado
              en embeddings semánticos para clasificar automáticamente artículos médicos en las siguientes
              especialidades:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Badge variant="outline" className="p-2 justify-center text-center">
                <span className="text-red-600 mr-1">❤️</span> Cardiovascular
              </Badge>
              <Badge variant="outline" className="p-2 justify-center text-center">
                <span className="text-blue-600 mr-1">🧠</span> Neurológica
              </Badge>
              <Badge variant="outline" className="p-2 justify-center text-center">
                <span className="text-green-600 mr-1">🫘</span> Hepatorrenal
              </Badge>
              <Badge variant="outline" className="p-2 justify-center text-center">
                <span className="text-purple-600 mr-1">🎗️</span> Oncológica
              </Badge>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border-l-4 border-emerald-500">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Objetivo Principal</h3>
              <p className="text-emerald-700 dark:text-emerald-300">
                Acelerar el proceso de revisión de literatura médica, permitiendo a investigadores y profesionales de la
                salud identificar rápidamente documentos relevantes para su campo de estudio especializado.
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-400">
              Navega por las diferentes secciones en el menú lateral para explorar los datos, probar el modelo en tiempo
              real y analizar sus métricas de rendimiento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-blue-600">👨‍💻</span> Información del Desarrollador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Juan David Rincón</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Desarrollador de Inteligencia Artificial y Machine Learning
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:jdrincone@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                >
                  <span className="text-blue-600">📧</span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">jdrincone@gmail.com</span>
                </a>

                <a
                  href="https://github.com/jdrincone/ia_medical_classifier_fullstack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">⚡</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Ver en GitHub</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

const ComoFuncionaPage = () => (
  <>
    <h1 className="font-semibold text-lg md:text-2xl">Arquitectura y Flujo de Trabajo</h1>
    <CardContent className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Concepto Clave: Embeddings Semánticos</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Esta solución utiliza Embeddings generados por un Modelo de Lenguaje Grande (LLM) para entender el{" "}
          <strong>contexto y el significado</strong> del texto, superando a los métodos tradicionales que solo cuentan
          palabras.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Diagrama de Flujo Completo del Sistema</h2>
        <div className="space-y-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle>Fase 1: Entrenamiento (Offline)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-4 text-center font-mono text-sm">
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                📄<br />
                Datos CSV
              </div>
              <div className="text-2xl text-blue-500">→</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                🐍<br />
                Script de Entrenamiento
              </div>
              <div className="text-2xl text-blue-500">→</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                📦<br />
                Artefactos del Modelo (.pkl)
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-900/20">
            <CardHeader>
              <CardTitle>Fase 2: Servicio del Backend (Online)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-4 text-center font-mono text-sm">
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                📦<br />
                Artefactos del Modelo (.pkl)
              </div>
              <div className="text-2xl text-emerald-500">→</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                ☁️
                <br />
                Servidor API (FastAPI)
              </div>
              <div className="text-2xl text-emerald-500">↔</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                🌐<br />
                Internet
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <CardHeader>
              <CardTitle>Fase 3: Interacción del Frontend (Online)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-4 text-center font-mono text-sm">
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                👤<br />
                Usuario
              </div>
              <div className="text-2xl text-purple-500">↔</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                💻<br />
                Navegador (React App)
              </div>
              <div className="text-2xl text-purple-500">↔</div>
              <div className="p-3 bg-white rounded-lg shadow dark:bg-gray-800">
                ☁️
                <br />
                Servidor API (FastAPI)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </>
)

const ExploratoryDataPage = ({
  data,
  isLoading,
  apiError,
}: { data: EdaData | null; isLoading: boolean; apiError: string | null }) => {
  if (isLoading) return <p>Cargando análisis de datos...</p>

  if (apiError) {
    return (
      <>
        <h1 className="font-semibold text-lg md:text-2xl">Análisis Exploratorio de Datos (EDA)</h1>
        <Alert className="mb-4 border-yellow-500">
          <AlertTitle>⚠️ API No Disponible</AlertTitle>
          <AlertDescription>
            No se pudo conectar con la API del modelo. Mostrando datos de ejemplo para demostración.
            <br />
            <span className="text-sm text-gray-500">Error: {apiError}</span>
          </AlertDescription>
        </Alert>
        <ExploratoryDataContent data={MOCK_EDA_DATA} />
      </>
    )
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudo cargar el análisis exploratorio.</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <h1 className="font-semibold text-lg md:text-2xl">Análisis Exploratorio de Datos (EDA)</h1>
      <ExploratoryDataContent data={data} />
    </>
  )
}

const ExploratoryDataContent = ({ data }: { data: EdaData }) => {
  const { general_stats, label_distribution, length_distribution } = data
  const labelData = Object.entries(label_distribution).map(([name, value]) => ({ name, count: value }))
  const lengthData = Object.entries(length_distribution).map(([name, value]) => ({ name, count: value }))
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF19AF"]

  return (
    <CardContent>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Entendiendo la forma y estructura del dataset para informar el desarrollo del modelo.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Artículos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{general_stats.total_articles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Longitud Promedio de Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {general_stats.avg_abstract_length} <span className="text-lg">caracteres</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas Únicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{general_stats.total_unique_labels}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Etiquetas</CardTitle>
            <CardDescription>Número de artículos por cada categoría.</CardDescription>
          </CardHeader>
          <CardContent style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={labelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Nº de Artículos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Longitud de Abstracts</CardTitle>
            <CardDescription>Nº de artículos por longitud de texto.</CardDescription>
          </CardHeader>
          <CardContent style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={lengthData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {lengthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  )
}

const MetricasPage = ({
  artifacts,
  isLoading,
  apiError,
}: { artifacts: EvaluationArtifacts | null; isLoading: boolean; apiError: string | null }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const dataToUse = apiError ? MOCK_ARTIFACTS : artifacts

  useEffect(() => {
    if (dataToUse && dataToUse.class_names && !selectedClass) {
      setSelectedClass(dataToUse.class_names[0])
    }
  }, [dataToUse, selectedClass])

  if (isLoading) return <p>Cargando artefactos de evaluación...</p>

  if (apiError) {
    return (
      <>
        <h1 className="font-semibold text-lg md:text-2xl">Métricas del Modelo</h1>
        <Alert className="mb-4 border-yellow-500">
          <AlertTitle>⚠️ API No Disponible</AlertTitle>
          <AlertDescription>
            No se pudo conectar con la API del modelo. Mostrando métricas de ejemplo para demostración.
            <br />
            <span className="text-sm text-gray-500">Error: {apiError}</span>
          </AlertDescription>
        </Alert>
        <MetricasContent artifacts={MOCK_ARTIFACTS} selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      </>
    )
  }

  if (!dataToUse || !dataToUse.test_report) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudieron cargar los datos de rendimiento.</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <h1 className="font-semibold text-lg md:text-2xl">Métricas del Modelo</h1>
      <MetricasContent artifacts={dataToUse} selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
    </>
  )
}

const MetricasContent = ({
  artifacts,
  selectedClass,
  setSelectedClass,
}: {
  artifacts: EvaluationArtifacts
  selectedClass: string | null
  setSelectedClass: (value: string) => void
}) => {
  const { train_report, test_report, confusion_matrices, curves_data, class_names } = artifacts
  const f1Score = test_report["weighted avg"]["f1-score"]
  const classCount = class_names.length
  const overfittingData = class_names.map((name: string) => ({
    name,
    Entrenamiento: Number.parseFloat(train_report[name]["f1-score"].toFixed(2)),
    Prueba: Number.parseFloat(test_report[name]["f1-score"].toFixed(2)),
  }))
  const classIndex = selectedClass ? class_names.indexOf(selectedClass) : 0
  const cm = confusion_matrices[classIndex]
  const rocCurveData = selectedClass
    ? curves_data[selectedClass].roc_curve.fpr.map((fpr: number, i: number) => ({
        fpr,
        tpr: curves_data[selectedClass].roc_curve.tpr[i],
      }))
    : []
  const aucScore = selectedClass ? curves_data[selectedClass].auc_score : 0

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <Card>
          <CardHeader>
            <CardTitle>F1-Score (Prueba)</CardTitle>
            <CardDescription>Balance entre precisión y recall</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600">{(f1Score * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Número de Clases</CardTitle>
            <CardDescription>Categorías de clasificación</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{classCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modelo Base</CardTitle>
            <CardDescription>Tecnología de vectorización</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">LLM Embeddings</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Análisis de Sobreajuste (Overfitting)</CardTitle>
          <CardDescription>
            Comparación del F1-Score. Si la barra "Entrenamiento" es mucho más alta que "Prueba", es un signo de
            sobreajuste.
          </CardDescription>
        </CardHeader>
        <CardContent style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={overfittingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Entrenamiento" fill="#8884d8" />
              <Bar dataKey="Prueba" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Análisis por Categoría</CardTitle>
          <CardDescription>Selecciona una categoría para ver su Matriz de Confusión y Curva ROC.</CardDescription>
          <Select value={selectedClass || ""} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una clase..." />
            </SelectTrigger>
            <SelectContent>
              {class_names.map((name: string) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div>
            <h3 className="font-semibold mb-2">Matriz de Confusión para: {selectedClass}</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-4 bg-green-100 rounded-lg dark:bg-green-900/50">
                <p className="text-xs">Verdaderos Positivos (TP)</p>
                <p className="text-2xl font-bold">{cm[1][1]}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-lg dark:bg-red-900/50">
                <p className="text-xs">Falsos Positivos (FP)</p>
                <p className="text-2xl font-bold">{cm[0][1]}</p>
              </div>
              <div className="p-4 bg-orange-100 rounded-lg dark:bg-orange-900/50">
                <p className="text-xs">Falsos Negativos (FN)</p>
                <p className="text-2xl font-bold">{cm[1][0]}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg dark:bg-blue-900/50">
                <p className="text-xs">Verdaderos Negativos (TN)</p>
                <p className="text-2xl font-bold">{cm[0][0]}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Curva ROC (AUC: {aucScore.toFixed(3)})</h3>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <LineChart data={rocCurveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="fpr" name="Tasa de Falsos Positivos" />
                  <YAxis type="number" dataKey="tpr" name="Tasa de Verdaderos Positivos" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#8884d8"
                    dot={false}
                    strokeWidth={2}
                    name="Tasa de Verdaderos Positivos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

const DemoPage = () => {
  const [title, setTitle] = useState("")
  const [abstract, setAbstract] = useState("")
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClassify = async () => {
    setIsLoading(true)
    setError(null)
    setPrediction(null)

    console.log("[v0] Starting classification request")
    console.log("[v0] API URL:", `${API_BASE_URL}/predict`)

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, abstract }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        throw new Error(`La comunicación con la API falló. Status: ${response.status}`)
      }

      const data: Prediction = await response.json()
      console.log("[v0] Prediction received:", data)
      setPrediction(data)
    } catch (err) {
      console.log("[v0] Classification error:", err)
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error."
      setError(`${errorMessage} Verifica que la API esté funcionando en: ${API_BASE_URL}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h1 className="font-semibold text-lg md:text-2xl">Demo Interactiva</h1>
      <Card>
        <CardHeader>
          <CardTitle>Clasificar un Nuevo Artículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Artículo</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="El rol de..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract del Artículo</Label>
            <Textarea
              id="abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={8}
              placeholder="Este estudio investiga..."
            />
          </div>
          <Button
            onClick={handleClassify}
            disabled={isLoading || !title || !abstract}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? "Clasificando..." : "Clasificar Artículo"}
          </Button>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {prediction && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Resultados de la Clasificación</h2>
          {prediction.is_low_confidence && (
            <Alert className="mb-4 border-yellow-500">
              <AlertTitle>⚠️ Baja Confianza Detectada</AlertTitle>
              <AlertDescription>Este es un buen candidato para revisión y re-entrenamiento.</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.labels.length > 0 ? (
              prediction.labels
                .map((label, index) => ({ label, confidence: prediction.confidences[index] }))
                .sort((a, b) => b.confidence - a.confidence)
                .map(({ label, confidence }) => (
                  <PredictionResultCard
                    key={label}
                    label={label}
                    confidence={confidence}
                    text={`${title} ${abstract}`}
                  />
                ))
            ) : (
              <p className="text-gray-500 col-span-2">
                El modelo no asignó ninguna categoría con suficiente confianza.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// --- Componente Principal del Dashboard ---
export default function Dashboard() {
  const [activePage, setActivePage] = useState("Análisis Exploratorio")
  const [artifacts, setArtifacts] = useState<EvaluationArtifacts | null>(null)
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(true)
  const [edaData, setEdaData] = useState<EdaData | null>(null)
  const [isLoadingEda, setIsLoadingEda] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      console.log("[v0] Starting data fetch from API:", API_BASE_URL)
      setIsLoadingArtifacts(true)
      setIsLoadingEda(true)
      setApiError(null)

      try {
        console.log("[v0] Fetching evaluation artifacts...")
        const artifactsRes = await fetch(`${API_BASE_URL}/evaluation-artifacts`)
        console.log("[v0] Artifacts response status:", artifactsRes.status)

        if (artifactsRes.ok) {
          const artifactsData = await artifactsRes.json()
          console.log("[v0] Artifacts loaded successfully")
          setArtifacts(artifactsData)
        } else {
          throw new Error(`Artifacts API returned ${artifactsRes.status}`)
        }
      } catch (error) {
        console.log("[v0] Error loading artifacts:", error)
        setApiError(error instanceof Error ? error.message : "Failed to fetch")
      } finally {
        setIsLoadingArtifacts(false)
      }

      try {
        console.log("[v0] Fetching EDA data...")
        const edaRes = await fetch(`${API_BASE_URL}/exploratory-data-analysis`)
        console.log("[v0] EDA response status:", edaRes.status)

        if (edaRes.ok) {
          const edaDataResult = await edaRes.json()
          console.log("[v0] EDA data loaded successfully")
          setEdaData(edaDataResult)
        } else {
          throw new Error(`EDA API returned ${edaRes.status}`)
        }
      } catch (error) {
        console.log("[v0] Error loading EDA data:", error)
        if (!apiError) {
          // Only set if not already set by artifacts error
          setApiError(error instanceof Error ? error.message : "Failed to fetch")
        }
      } finally {
        setIsLoadingEda(false)
      }
    }
    fetchData()
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case "Resumen":
        return <ResumenPage />
      case "Análisis Exploratorio":
        return <ExploratoryDataPage data={edaData} isLoading={isLoadingEda} apiError={apiError} />
      case "Demo":
        return <DemoPage />
      case "Métricas del Modelo":
        return <MetricasPage artifacts={artifacts} isLoading={isLoadingArtifacts} apiError={apiError} />
      case "Cómo Funciona":
        return <ComoFuncionaPage />
      default:
        return <ExploratoryDataPage data={edaData} isLoading={isLoadingEda} apiError={apiError} />
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <a className="flex items-center gap-2 font-semibold" href="#">
              <ClipboardIcon className="h-6 w-6 text-emerald-600" />
              <span className="text-gray-900 dark:text-gray-50">Clasificador Médico IA</span>
            </a>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {["Resumen", "Análisis Exploratorio", "Demo", "Métricas del Modelo", "Cómo Funciona"].map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${activePage === page && "bg-gray-200/50 dark:bg-gray-800"}`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{renderPage()}</main>
      </div>
    </div>
  )
}

function ClipboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}
