import json
import re
import os

appdata_dir = os.path.expanduser(r'~\.gemini\antigravity\brain')

print("Searching transcripts in:", appdata_dir)

found_entries = []

for root, dirs, files in os.walk(appdata_dir):
    for f in files:
        if f.endswith('.jsonl') or f.endsWith('.json') if hasattr(f, 'endsWith') else f.endswith('.json'):
            filepath = os.path.join(root, f)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    if 'biography' in content or '1783955141' in content or 'sw69l6795go' in content:
                        for line in content.splitlines():
                            if 'education' in line or 'experience' in line or 'biography' in line:
                                if '1783955' in line or 'sw69l6795go' in line or 'THPT' in line or 'Hoàng Tử Quỷ' in line:
                                    found_entries.append((filepath, line[:300]))
            except Exception as e:
                pass

print(f"Total matching transcript lines found: {len(found_entries)}")
for path, sample in found_entries[:20]:
    print(f"File: {path}")
    print(f"Sample: {sample}\n")
