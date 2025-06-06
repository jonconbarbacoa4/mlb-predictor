import requests

url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting'
response = requests.get(url)
data = response.json()

teams_stats = data['stats'][0]['splits']

print("📋 Equipos devueltos por la API:\n")
for item in teams_stats:
    team_id = int(item['team']['id'])
    team_name = item['team']['name']
    print(f"{team_id} - {team_name}")