import csv
import os
import requests

def get_all_team_stats():
    url = "https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting"
    res = requests.get(url)
    data = res.json()

    stats_list = []
    seen_ids = set()
    for item in data.get("stats", []):
        for split in item.get("splits", []):
            team = split.get("team", {})
            stat = split.get("stat", {})
            team_id = team.get("id")

            if team_id and stat and team_id not in seen_ids:
                stats_list.append({
                    "teamId": int(team_id),
                    "runsPerGame": stat.get("runsPerGame", "0"),
                    "avg": stat.get("avg", "0"),
                    "obp": stat.get("obp", "0"),
                    "slg": stat.get("slg", "0"),
                    "ops": stat.get("ops", "0")
                })
                seen_ids.add(team_id)

    return sorted(stats_list, key=lambda x: x["teamId"])

def main():
    stats = get_all_team_stats()

    if not stats:
        print("⚠️ No se encontraron estadísticas.")
        return

    print("📋 Equipos MLB encontrados:")
    for s in stats:
        print(f"{s['teamId']} - {s}")

    os.makedirs("data", exist_ok=True)
    filepath = os.path.join("data", "mlb_stats_2025.csv")

    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["teamId", "runsPerGame", "avg", "obp", "slg", "ops"])
        writer.writeheader()
        writer.writerows(stats)

    print(f"✅ CSV limpio generado con {len(stats)} equipos: {filepath}")

if __name__ == "__main__":
    main()