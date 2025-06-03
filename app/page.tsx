'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

const partidosIniciales = [
  {
    local: "Pirates",
    visitante: "Astros",
    stats: {
      Pirates: { rpg: 3.9, rpga: 4.2, win_pct: 0.45, era: 2.15, home: 1 },
      Astros: { rpg: 4.5, rpga: 3.8, win_pct: 0.55, era: 5.89, home: 0 },
    },
  },
  {
    local: "Marlins",
    visitante: "Rockies",
    stats: {
      Marlins: { rpg: 4.1, rpga: 5.1, win_pct: 0.40, era: 8.47, home: 1 },
      Rockies: { rpg: 3.2, rpga: 5.5, win_pct: 0.17, era: 6.0, home: 0 },
    },
  },
  {
    local: "Nationals",
    visitante: "Cubs",
    stats: {
      Nationals: { rpg: 4.5, rpga: 5.0, win_pct: 0.45, era: 4.5, home: 1 },
      Cubs: { rpg: 5.8, rpga: 4.8, win_pct: 0.60, era: 3.6, home: 0 },
    },
  },
]

function calcularScore({ rpg, rpga, win_pct, era, home }) {
  return (
    rpg * 0.4 +
    (1 - rpga / 10) * 0.2 +
    win_pct * 0.2 +
    (1 - era / 10) * 0.1 +
    home * 0.1
  )
}

export default function MLBPredictorApp() {
  const [partidos] = useState(partidosIniciales)

  return (
    <div className="p-6 grid gap-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Predicciones MLB</h1>
      {partidos.map(({ local, visitante, stats }, index) => {
        const scoreLocal = calcularScore(stats[local])
        const scoreVisitante = calcularScore(stats[visitante])
        const ganador = scoreLocal > scoreVisitante ? local : visitante

        return (
          <Card key={index} className="border shadow-md">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">
                {visitante} @ {local}
              </h2>
              <p className="mt-2"><strong>Score {local}:</strong> {scoreLocal.toFixed(3)}</p>
              <p><strong>Score {visitante}:</strong> {scoreVisitante.toFixed(3)}</p>
              <p className="mt-2 font-bold text-green-700">
                Predicción: Gana {ganador}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}