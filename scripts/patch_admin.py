import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# AdminCreateDemo defaults
code = code.replace("placeholder=\"Sáng tác (A.C Xuân Tài)\"", "placeholder={`Sáng tác (${appData?.artistName || 'Nghệ sĩ'})`}")
code = code.replace("placeholder=\"Ca sĩ (A.C Xuân Tài)\"", "placeholder={`Ca sĩ (${appData?.artistName || 'Nghệ sĩ'})`}")

# For AdminCreateDemo payload
code = code.replace("singer: singer || 'A.C Xuân Tài',", "singer: singer || appData?.artistName || 'Nghệ sĩ',")
code = code.replace("composer: composer || 'A.C Xuân Tài',", "composer: composer || appData?.artistName || 'Nghệ sĩ',")

with open('src/App.tsx', 'w') as f:
    f.write(code)
