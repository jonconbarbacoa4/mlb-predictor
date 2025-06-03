'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getGamesByDate, getTeamStats } from "@/lib/mlbApi"

export default function MLBPredictorApp() {
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [partidos, setPartidos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchPartidos() {
      setLoading(true)
      const juegos = await getGamesByDate(fecha)

      const partidosConStats = await Promise.all(
        juegos.map(async (juego: any) => {
          const homeStats = await getTeamStats(juego.homeTeamId)
          const awayStats = await getTeamStats(juego.awayTeamId)

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

      setPartidos(partidosConStats)
      setLoading(false)
    }

    fetchPartidos()
  }, [fecha])

  function calcularScore(stats: any) {
    const { rpg, obp, slg } = stats
    return (rpg || 0) * 0.4 + (obp || 0) * 100 * 0.3 + (slg || 0) * 100 * 0.3
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (por fecha)</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Selecciona la fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded px-3 py-1"
        />
      </div>

      {loading ? (
        <p>Cargando partidos...</p>
      ) : partidos.length === 0 ? (
        <p>No hay partidos programados para esta fecha.</p>
      ) : (
        partidos.map((partido, index) => {
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
        })
      )}
    </main>
  )
}