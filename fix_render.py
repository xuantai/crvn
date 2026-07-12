import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_string = """          </>
        )}
        {isAbout && <PublicAboutView aboutMe={data.aboutMe} />}
        {isBio && <PublicBioView biography={data.biography} t={t} />}
      </main>"""

# Find all occurrences of bad_string
occurrences = [m.start() for m in re.finditer(re.escape(bad_string), content)]

# The first one is in Home, the second is in AdminDashboard.
if len(occurrences) > 1:
    second_idx = occurrences[1]
    content = content[:second_idx] + "</main>" + content[second_idx + len(bad_string):]

with open('src/App.tsx', 'w') as f:
    f.write(content)
