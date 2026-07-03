import json

with open('artists.json', 'r') as f:
    artists = json.load(f)

# Filter out the garbage
artists = [a for a in artists if a.get('username') not in ['src', '@vite', 'node_modules']]

with open('artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)
