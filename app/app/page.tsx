"use client"

import { useState } from "react"

type Step = "topic" | "apikey" | "contentLine" | "subtopic" | "language" | "searching" | "results" | "error"

interface Article {
  title: string
  authors: string
  year: string
  journal: string
  link: string
  source: string
  abstract: string
}

const LANGUAGE_OPTIONS = ["Português", "Inglês", "Ambos"]
const CONTENT_LINE_OPTIONS = [
  "Perspectiva teórica (conceitos, modelos, revisões)",
  "Perspectiva prática (estudos de caso, dados empíricos)",
  "Ambas",
]

export default function Home() {
  const [step, setStep] = useState<Step>("topic")
  const [topic, setTopic] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [contentLine, setContentLine] = useState("")
  const [subtopic, setSubtopic] = useState("")
  const [articles, setArticles] = useState<Article[]>([])
  const [error, setError] = useState("")
  const [input, setInput] = useState("")

  const handleTopicSubmit = () => {
    if (!input.trim()) return
    setTopic(input.trim())
    setInput("")
    setStep("apikey")
  }

  const handleApiKeySubmit = () => {
    if (!input.trim()) return
    setApiKey(input.trim())
    setInput("")
    setStep("contentLine")
  }

  const handleContentLine = (value: string) => {
    setContentLine(value)
    setStep("subtopic")
  }

  const handleSubtopicSubmit = () => {
    if (!input.trim()) return
    setSubtopic(input.trim())
    setInput("")
    setStep("language")
  }

  const handleLanguage = async (value: string) => {
    setStep("searching")
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentLine, subtopic, language: value, apiKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro desconhecido.")
        setStep("error")
        return
      }
      setArticles(data.articles)
      setStep("results")
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setStep("error")
    }
  }

  const reset = () => {
    setStep("topic")
    setTopic("")
    setApiKey("")
    setContentLine("")
    setSubtopic("")
    setArticles([])
    setError("")
    setInput("")
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Buscador de Artigos Científicos
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            TOP 3 artigos gratuitos e validados, entregues direto para você.
          </p>
        </div>

        {step === "topic" && (
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium">
              Qual tema você quer pesquisar?
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Ex: empreendedorismo cristão"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTopicSubmit()}
              autoFocus
            />
            <button
              onClick={handleTopicSubmit}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-700 transition"
            >
              Continuar
            </button>
          </div>
        )}

        {step === "apikey" && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Tema: <span className="font-medium text-gray-900">{topic}</span>
            </p>
            <label className="block text-gray-700 font-medium">
              Cole sua API Key do Google AI Studio (Gemini):
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="AIza..."
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleApiKeySubmit()}
              autoFocus
            />
            <p className="text-xs text-gray-400">
              Usada apenas nesta sessão. Não é armazenada.
            </p>
            <button
              onClick={handleApiKeySubmit}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-700 transition"
            >
              Continuar
            </button>
          </div>
        )}

        {step === "contentLine" && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Tema: <span className="font-medium text-gray-900">{topic}</span>
            </p>
            <label className="block text-gray-700 font-medium">
              Qual abordagem você quer?
            </label>
            <div className="space-y-2">
              {CONTENT_LINE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleContentLine(opt)}
                  className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "subtopic" && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Tema: <span className="font-medium text-gray-900">{topic}</span>
            </p>
            <label className="block text-gray-700 font-medium">
              Qual subtema específico dentro de{" "}
              <span className="text-gray-900">{topic}</span>?
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Ex: perfil e motivações do empreendedor"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubtopicSubmit()}
              autoFocus
            />
            <button
              onClick={handleSubtopicSubmit}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-700 transition"
            >
              Continuar
            </button>
          </div>
        )}

        {step === "language" && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Tema: <span className="font-medium text-gray-900">{topic}</span>
            </p>
            <label className="block text-gray-700 font-medium">
              Prefere artigos em qual idioma?
            </label>
            <div className="space-y-2">
              {LANGUAGE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleLanguage(opt)}
                  className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "searching" && (
          <div className="text-center space-y-4 py-12">
            <div className="inline-block w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">
              Buscando em PubMed, arXiv e Semantic Scholar...
            </p>
            <p className="text-gray-400 text-sm">
              Validando qualidade e selecionando os TOP 3.
            </p>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                TOP 3 — {topic}
              </h2>
              <button
                onClick={reset}
                className="text-sm text-gray-400 hover:text-gray-700 transition"
              >
                Nova busca
              </button>
            </div>
            {articles.map((article, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-5 space-y-2"
              >
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Artigo {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900 leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Autores:</span> {article.authors}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>{article.year}</span>
                  <span>{article.journal}</span>
                  <span className="text-gray-400">{article.source}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {article.abstract}
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-gray-900 font-medium underline underline-offset-2 hover:text-gray-500 transition"
                >
                  Acessar artigo gratis
                </a>
              </div>
            ))}
            <button
              onClick={reset}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
            >
              Nova pesquisa
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4 text-center py-8">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={reset}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
