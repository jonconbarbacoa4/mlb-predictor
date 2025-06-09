import csv
import os
import requests

# IDs oficiales de los 30 equipos MLB
MLB_TEAM_IDS = [
    108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
    118, 119, 120, 121, 133, 134, 135, 136, 137, 138,
    139, 140, 141, 142, 143, 144, 145, 146, 147, 158
]

def get_team_stats(team_id):
    url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}/stats?season=2025&group=hitting"
    try:
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        stat = data.get("stats", [{}])[0].get("splits", [{}])[0].get("stat", {})

        return {
            "teamId": team_id,
            "runsPerGame": stat.get("runsPerGame", "0"),
            "avg": stat.get("avg", "0"),
            "obp": stat.get("obp", "0"),
            "slg": stat.get("slg", "0"),
            "ops": stat.get("ops", "0"),
        }
    except Exception as e:
        print(f"❌ Error con el equipo {team_id}: {e}")
        return {
            "teamId": team_id,
            "runsPerGame": "0",
            "avg": "0",
            "obp": "0",
            "slg": "0",
            "ops": "0",
        }

def main():
    print("📋 Generando estadísticas para equipos MLB...")
    rows = []

    for team_id in MLB_TEAM_IDS:
        stats = get_team_stats(team_id)
        print(f"{team_id} - {stats}")
        rows.append(stats)

    os.makedirs("public/data", exist_ok=True)
    filepath = os.path.join("public", "data", "mlb_stats_2025.csv")

    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["teamId", "runsPerGame", "avg", "obp", "slg", "ops"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ CSV limpio generado con {len(rows)} equipos: {filepath}")

if __name__ == "__main__":
    main()