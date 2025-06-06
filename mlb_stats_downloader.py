import requests
import csv

# URL de la API con estadísticas generales de bateo por equipo en 2025
url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting'

response = requests.get(url)
data = response.json()

teams_stats = data['stats'][0]['splits']

with open('mlb_stats_2025.csv', 'w', newline='') as csvfile:
    fieldnames = ['teamId', 'teamName', 'avg', 'obp', 'slg', 'ops', 'runsPerGame']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for item in teams_stats:
        stat = item['stat']
        writer.writerow({
            'teamId': item['team']['id'],
            'teamName': item['team']['name'],
            'avg': stat.get('avg', '0'),
            'obp': stat.get('obp', '0'),
            'slg': stat.get('slg', '0'),
            'ops': stat.get('ops', '0'),
            'runsPerGame': stat.get('runsPerGame', '0'),
        })

print("✅ Datos guardados en 'mlb_stats_2025.csv'")