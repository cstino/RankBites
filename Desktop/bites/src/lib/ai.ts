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

        const prompt = `Genera una breve recensione in italiano (2-3 frasi, massimo 50 parole) per il ristorante "${restaurantName}".

Voti ricevuti (scala 1-10):
${ratingsText}
Media: ${overallAvg.toFixed(1)}/10

SCALA DI INTERPRETAZIONE:
1-2 = terribile (molto male)
3-4 = gravemente insufficiente  (punto debole)
5 = insufficiente (da migliorare)
6 = sufficiente (appena accettabile)
7 = più che sufficiente (buono)
8 = ottimo (punto di forza)
9 = eccellente (un'eccellenza)
10 = perfetto (la perfezione)

REGOLE:
- Terza persona, tono distaccato e oggettivo
- Identifica CORRETTAMENTE i punti di forza (voti ≥8) e debolezze (voti ≤5)
- Un voto 5 o inferiore è SEMPRE un punto debole, MAI un punto forte
- Un voto 6 è neutro/sufficiente, non è né forte né debole
- "Conto" con voto alto = buon rapporto qualità-prezzo
- NON citare numeri nella recensione
- Concludi con giudizio complessivo

ESEMPIO:
"Il ristorante convince soprattutto per il menu e il rapporto qualità-prezzo, mentre la location risulta il punto più debole. Nel complesso un'esperienza positiva e consigliata."

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
