import { NextRequest, NextResponse } from "next/server"
import { searchAll } from "@/lib/search"
import { selectTop3 } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { topic, contentLine, subtopic, language, apiKey } = await req.json()

    if (!topic || !apiKey) {
      return NextResponse.json({ error: "Tema e API key são obrigatórios." }, { status: 400 })
    }

    const query = `${topic} ${subtopic ?? ""}`.trim()
    const articles = await searchAll(query)

    if (articles.length === 0) {
      return NextResponse.json({ error: "Nenhum artigo encontrado. Tente outro termo." }, { status: 404 })
    }

    const top3 = await selectTop3(articles, topic, contentLine ?? "", subtopic ?? "", language ?? "português", apiKey)
    return NextResponse.json({ articles: top3 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao buscar artigos. Verifique sua API key." }, { status: 500 })
  }
}
