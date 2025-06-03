'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getWeeklyGames, getTeamStats } from "@/lib/mlbApi"

export default function MLBPredictorApp() {
  const [partidos, setPartidos] = useState<any[]>([])

  useEffect(() => {
    async function fetchPartidos() {
      const juegos = await getWeeklyGames()

      const partidosConStats = await Promise.all(
        juegos.map(async (juego: any) => {
          const homeStats = await getTeamStats(juego.homeTeamId)
          const awayStats = await getTeamStats(juego.awayTeamId)

          return {
            local: juego.homeTeam,
            visitante: juego.awayTeam,
            date: juego.date,
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

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (semana)</h1>

      {partidos.map((partido, index) => {
        const { local, visitante, stats, date } = partido
        const scoreLocal = calcularScore(stats[local])
        const scoreVisitante = calcularScore(stats[visitante])
        const ganador = scoreLocal > scoreVisitante ? local : visitante

        return (
          <main className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Predicciones MLB (semana)</h1>

    {Object.entries(
      partidos.reduce((acc, partido) => {
        const { date } = partido
        if (!acc[date]) acc[date] = []
        acc[date].push(partido)
        return acc
      }, {} as Record<string, any[]>)
    )
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([fecha, juegos]) => (
        <div key={fecha} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            📅 {new Date(fecha).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </h2>

          {juegos.map((partido, index) => {
            const { local, visitante, stats } = partido
            const scoreLocal = calcularScore(stats[local])
            const scoreVisitante = calcularScore(stats[visitante])
            const ganador = scoreLocal > scoreVisitante ? local : visitante

            return (
              <Card key={index} className="border shadow-sm mb-3">
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold">
                    {visitante} @ {local}
                  </h3>
                  <p><strong>{local}:</strong> {scoreLocal.toFixed(2)}</p>
                  <p><strong>{visitante}:</strong> {scoreVisitante.toFixed(2)}</p>
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
      })}
    </main>
  )
}