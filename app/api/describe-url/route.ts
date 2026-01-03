import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DATAWIZZ_API_KEY,
  baseURL: process.env.DATAWIZZ_BASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Fetch the URL content
    let pageContent = ''
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LaunchReady/1.0)',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const html = await response.text()

        pageContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000)
      }
    } catch (fetchError) {
      console.log('Could not fetch URL, will generate based on domain name only')
    }

    const domain = new URL(normalizedUrl).hostname.replace('www.', '')

    const completion = await client.chat.completions.create({
      model: process.env.DATAWIZZ_ENDPOINT || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are helping a startup founder describe their project for IP protection purposes. 
Generate a concise 1-2 sentence description of what this product/company does based on the information provided.
Focus on: what the product is, who it's for, and what problem it solves.
Be professional but conversational. Don't use marketing fluff.
If you can't determine what the product does, make a reasonable guess based on the domain name.
Respond with ONLY the description, no quotes or preamble.`
        },
        {
          role: 'user',
          content: pageContent
            ? `Domain: ${domain}\n\nPage content:\n${pageContent}`
            : `Domain: ${domain}\n\nNo page content available - please suggest a description based on the domain name.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const description = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({
      description,
      domain,
      hadContent: !!pageContent
    })

  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}