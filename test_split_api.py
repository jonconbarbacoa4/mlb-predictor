import requests
import json

team_id = 133  # Puedes probar otros IDs también
url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}/stats?stats=vsHanded&type=season&season=2025"

res = requests.get(url)
data = res.json()

print(json.dumps(data, indent=2))
