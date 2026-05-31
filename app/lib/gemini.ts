import { GoogleGenerativeAI } from "@google/generative-ai"
import { Article } from "./search"

export async function selectTop3(
  articles: Article[],
  topic: string,
  contentLine: string,
  subtopic: string,
  language: string,
  apiKey: string
): Promise<Article[]> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
Você é um assistente de pesquisa acadêmica. Analise os artigos abaixo e selecione os 3 mais relevantes para:
- Tema: ${topic}
- Subtema: ${subtopic}
- Linha de conteúdo: ${contentLine}
- Idioma preferido: ${language}

Para cada artigo selecionado, forneça um resumo em PORTUGUÊS explicando o que investiga, o método e o principal achado.

Artigos disponíveis:
${articles.map((a, i) => `
[${i}] Título: ${a.title}
Autores: ${a.authors}
Ano: ${a.year}
Revista: ${a.journal}
Fonte: ${a.source}
Link: ${a.link}
Resumo original: ${a.abstract}
`).join("\n")}

Responda APENAS com JSON válido neste formato:
{
  "top3": [
    {
      "index": 0,
      "resumo_pt": "Resumo em português aqui"
    }
  ]
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) return articles.slice(0, 3)

  const parsed = JSON.parse(json)
  return parsed.top3.map((item: { index: number; resumo_pt: string }) => ({
    ...articles[item.index],
    abstract: item.resumo_pt,
  }))
}
