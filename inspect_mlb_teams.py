import requests

url = 'https://statsapi.mlb.com/api/v1/teams?sportId=1'
res = requests.get(url)
data = res.json()

print("📋 Equipos MLB encontrados:")
for team in data['teams']:
    print(f"{team['id']} - {team['name']}")