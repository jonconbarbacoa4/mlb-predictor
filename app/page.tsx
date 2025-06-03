'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getTodayGames, getTeamStats } from "@/lib/mlbApi"

export default function MLBPredictorApp() {
  const [partidos, setPartidos] = useState<any[]>([])

  useEffect(() => {
    async function fetchPartidos() {
      const juegos = await getTodayGames()

      const partidosConStats = await Promise.all(
        juegos.map(async (juego: any) => {
          const homeStats = await getTeamStats(juego.homeTeamId)
          const awayStats = await getTeamStats(juego.awayTeamId)

          return {
            fecha: juego.gameDate?.split('T')[0] || 'Sin fecha',
            local: juego.homeTeam,
            visitante: juego.awayTeam,
            stats: {
              [juego.homeTeam]: { ...homeStats, home: 1 },
              [juego.awayTeam]: { ...awayStats, home: 0 },
            },
          }
        })
      )

      setPartidos(partidosConStats)
    }

    fetchPartidos()
  }, [])

  function calcularScore(stats: any) {
    const { rpg, obp, slg } = stats
    return (rpg || 0) * 0.4 + (obp || 0) * 100 * 0.3 + (slg || 0) * 100 * 0.3
  }

  const juegosPorFecha: Record<string, any[]> = partidos.reduce((acc, partido) => {
    const { fecha } = partido
    acc[fecha] = acc[fecha] || []
    acc[fecha].push(partido)
    return acc
  }, {})

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (datos reales)</h1>

      {Object.entries(juegosPorFecha).map(([fecha, juegos]) => (
        <div key={fecha}>
          <h2 className="text-xl font-semibold mt-6 mb-2">{fecha}</h2>

          {juegos.map((partido, index) => {
            const { local, visitante, stats } = partido
            const scoreLocal = calcularScore(stats[local])
            const scoreVisitante = calcularScore(stats[visitante])
            const ganador = scoreLocal > scoreVisitante ? local : visitante

            return (
              <Card key={`${fecha}-${local}-${visitante}-${index}`} className="border shadow-md my-2">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{visitante} @ {local}</h3>
                  <p><strong>Score {local}:</strong> {scoreLocal.toFixed(2)}</p>
                  <p><strong>Score {visitante}:</strong> {scoreVisitante.toFixed(2)}</p>
                  <p className="mt-2 font-bold text-green-700">
                    Predicción: Gana {ganador}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ))}
    </main>
  )
}