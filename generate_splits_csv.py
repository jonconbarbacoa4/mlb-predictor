import csv
import os
import requests

def get_splits_for_all_teams():
    url = "https://statsapi.mlb.com/api/v1/teams?sportId=1"
    teams = requests.get(url).json()["teams"]

    data = []
    for team in teams:
        team_id = team["id"]
        splits_url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}/stats?stats=vsHanded&type=season&season=2025"
        res = requests.get(splits_url)
        json_data = res.json()

        try:
            splits = json_data["stats"][0]["splits"]
            vs_rhp = next((s for s in splits if s["hand"] == "R"), {}).get("stat", {}).get("ops", "0")
            vs_lhp = next((s for s in splits if s["hand"] == "L"), {}).get("stat", {}).get("ops", "0")
            data.append({
                "teamId": team_id,
                "vsRHP": vs_rhp,
                "vsLHP": vs_lhp
            })
        except Exception as e:
            print(f"❌ Error con el equipo {team_id}: {e}")

    return data

def save_csv(data):
    os.makedirs("public/data", exist_ok=True)
    with open("public/data/splits_2025.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["teamId", "vsRHP", "vsLHP"])
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    print("🔄 Generando splits ofensivos...")
    data = get_splits_for_all_teams()
    save_csv(data)
    print(f"✅ CSV generado con {len(data)} equipos: public/data/splits_2025.csv")
