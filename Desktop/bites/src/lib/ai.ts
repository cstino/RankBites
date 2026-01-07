import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
})

export async function generateMiniReview(
    restaurantName: string,
    categoryRatings: Record<string, number>
): Promise<string | null> {
    if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not set, skipping AI review generation')
        return null
    }

    try {
        const ratingsText = Object.entries(categoryRatings)
            .map(([name, score]) => `${name}: ${score.toFixed(1)}`)
            .join(', ')

        const overallAvg =
            Object.values(categoryRatings).reduce((a, b) => a + b, 0) /
            Object.values(categoryRatings).length

        // Pre-analyze strengths and weaknesses
        const strengths = Object.entries(categoryRatings)
            .filter(([, score]) => score >= 8)
            .map(([name]) => name)

        const weaknesses = Object.entries(categoryRatings)
            .filter(([, score]) => score <= 5)
            .map(([name]) => name)

        const neutral = Object.entries(categoryRatings)
            .filter(([, score]) => score > 5 && score < 8)
            .map(([name]) => name)

        let analysisHint = ''
        if (weaknesses.length > 0) {
            analysisHint += `\nPUNTI DEBOLI (voti ≤5, CRITICARE): ${weaknesses.join(', ')}`
        }
        if (strengths.length > 0) {
            analysisHint += `\nPUNTI DI FORZA (voti ≥8, ELOGIARE): ${strengths.join(', ')}`
        }
        if (neutral.length > 0) {
            analysisHint += `\nASPETTI NEUTRI (voti 6-7): ${neutral.join(', ')}`
        }

        let toneHint = ''
        if (overallAvg <= 4) {
            toneHint = 'Il tono della recensione deve essere NEGATIVO/CRITICO.'
        } else if (overallAvg <= 5.5) {
            toneHint = 'Il tono della recensione deve essere MISTO CON PREVALENZA NEGATIVA.'
        } else if (overallAvg <= 6.5) {
            toneHint = 'Il tono della recensione deve essere NEUTRO/MISTO.'
        } else if (overallAvg <= 7.5) {
            toneHint = 'Il tono della recensione deve essere POSITIVO.'
        } else {
            toneHint = 'Il tono della recensione deve essere MOLTO POSITIVO/ENTUSIASTA.'
        }

        const prompt = `Genera una breve recensione in italiano (2-3 frasi, massimo 50 parole) per il ristorante "${restaurantName}".

Voti ricevuti (scala 1-10):
${ratingsText}
Media complessiva: ${overallAvg.toFixed(1)}/10
${analysisHint}

IMPORTANTE - INTERPRETAZIONE VOTI:
- Voti 1-5 sono INSUFFICIENTI/NEGATIVI (devono essere criticati!)
- Voto 6 è APPENA SUFFICIENTE
- Voti 7-8 sono BUONI
- Voti 9-10 sono ECCELLENTI

${toneHint}

REGOLE ASSOLUTE:
- Se un aspetto ha voto ≤5, DEVI criticarlo come punto debole
- Se un aspetto ha voto ≥8, puoi elogiarlo come punto di forza
- NON elogiare MAI aspetti con voti bassi (≤5)
- Terza persona, tono distaccato
- "Conto" alto = buon rapporto qualità-prezzo
- NON citare numeri
- Concludi con giudizio complessivo coerente con la media

Genera solo la recensione, senza virgolette.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            max_tokens: 150,
            temperature: 0.7,
        })

        const text = completion.choices[0]?.message?.content

        // Clean up the response
        return text?.trim().replace(/^["']|["']$/g, '') || null
    } catch (error) {
        console.error('Error generating AI review:', error)
        return null
    }
}
