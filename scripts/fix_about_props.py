with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "{isAbout && <PublicAboutView aboutMe={data.aboutMe} />}",
    "{isAbout && <PublicAboutView aboutMe={data.aboutMe} data={data} t={t} />}"
)

content = content.replace(
    "{isBio && <PublicBioView biography={data.biography} />}",
    "{isBio && <PublicBioView biography={data.biography} t={t} />}"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed props")
