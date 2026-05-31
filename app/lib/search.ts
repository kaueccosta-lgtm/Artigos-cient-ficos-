export interface Article {
  title: string
  authors: string
  year: string
  journal: string
  link: string
  source: string
  abstract: string
}

export async function searchPubMed(query: string): Promise<Article[]> {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query + " free full text[filter]")}&retmax=5&retmode=json`
  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()
  const ids: string[] = searchData.esearchresult?.idlist ?? []
  if (ids.length === 0) return []

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${ids.join(",")}&retmode=json`
  const summaryRes = await fetch(summaryUrl)
  const summaryData = await summaryRes.json()

  const articles: Article[] = []
  for (const id of ids) {
    const item = summaryData.result?.[id]
    if (!item) continue
    const authors = (item.authors ?? []).slice(0, 3).map((a: { name: string }) => a.name).join("; ")
    if (!authors) continue
    articles.push({
      title: item.title ?? "",
      authors,
      year: item.pubdate?.split(" ")[0] ?? "",
      journal: item.fulljournalname ?? item.source ?? "",
      link: `https://pmc.ncbi.nlm.nih.gov/articles/PMC${id}/`,
      source: "PubMed Central",
      abstract: item.title ?? "",
    })
  }
  return articles
}

export async function searchArXiv(query: string): Promise<Article[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`
  const res = await fetch(url)
  const text = await res.text()

  const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []
  const articles: Article[] = []

  for (const entry of entries) {
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? ""
    const authorMatches = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)]
    const authors = authorMatches.slice(0, 3).map(m => m[1].trim()).join("; ")
    if (!authors) continue
    const year = entry.match(/<published>(\d{4})/)?.[1] ?? ""
    const id = entry.match(/<id>.*\/(\d+\.\d+)<\/id>/)?.[1] ?? ""
    const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().slice(0, 300) ?? ""

    if (!id) continue
    articles.push({
      title,
      authors,
      year,
      journal: "arXiv",
      link: `https://arxiv.org/abs/${id}`,
      source: "arXiv",
      abstract,
    })
  }
  return articles
}

export async function searchSemanticScholar(query: string): Promise<Article[]> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,venue,externalIds,abstract,openAccessPdf&limit=5`
  const res = await fetch(url, { headers: { "User-Agent": "ArticleSearchApp/1.0" } })
  const data = await res.json()

  const articles: Article[] = []
  for (const paper of data.data ?? []) {
    const pdfUrl = paper.openAccessPdf?.url
    if (!pdfUrl) continue
    const authors = (paper.authors ?? []).slice(0, 3).map((a: { name: string }) => a.name).join("; ")
    if (!authors) continue
    articles.push({
      title: paper.title ?? "",
      authors,
      year: String(paper.year ?? ""),
      journal: paper.venue ?? "Semantic Scholar",
      link: pdfUrl,
      source: "Semantic Scholar",
      abstract: paper.abstract?.slice(0, 300) ?? "",
    })
  }
  return articles
}

export async function searchAll(query: string): Promise<Article[]> {
  const [pubmed, arxiv, semantic] = await Promise.allSettled([
    searchPubMed(query),
    searchArXiv(query),
    searchSemanticScholar(query),
  ])

  const results: Article[] = []
  if (pubmed.status === "fulfilled") results.push(...pubmed.value)
  if (arxiv.status === "fulfilled") results.push(...arxiv.value)
  if (semantic.status === "fulfilled") results.push(...semantic.value)
  return results
}
