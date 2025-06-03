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

          if (!homeStats || !awayStats) return null

          return {
            gamePk: juego.gamePk,
            local: juego.homeTeam,
            visitante: juego.awayTeam,
            stats: {
              [juego.homeTeam]: { ...homeStats, home: 1 },
              [juego.awayTeam]: { ...awayStats, home: 0 },
            },
          }
        })
      )

      setPartidos(partidosConStats.filter(Boolean))
    }

    fetchPartidos()
  }, [])

  function calcularScore(stats: any) {
    const { rpg, obp, slg } = stats
    return (rpg || 0) * 0.4 + (obp || 0) * 100 * 0.3 + (slg || 0) * 100 * 0.3
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (datos reales)</h1>

      {partidos.map((partido, index) => {
        const { local, visitante, stats } = partido
        const scoreLocal = calcularScore(stats[local])
        const scoreVisitante = calcularScore(stats[visitante])
        const ganador = scoreLocal > scoreVisitante ? local : visitante

        return (
          <Card key={partido.gamePk || index} className="border shadow-md my-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">
                {visitante} @ {local}
              </h2>
              <p><strong>Score {local}:</strong> {scoreLocal.toFixed(2)}</p>
              <p><strong>Score {visitante}:</strong> {scoreVisitante.toFixed(2)}</p>
              <p className="mt-2 font-bold text-green-700">
                Predicción: Gana {ganador}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </main>
  )
}