with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix tab 1
content = content.replace(
    '<span className="whitespace-nowrap relative z-10">{data?.tab1Name || t.lReleasedMobile || t.lReleased}</span>',
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab1Name?.trim() || t.lReleasedMobile || t.lReleased || "Ra Rồi"}</span>'
)

# Fix tab 2
content = content.replace(
    '<span className="whitespace-nowrap relative z-10">{data?.tab2Name || t.lDemosMobile || t.lDemos}</span>',
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab2Name?.trim() || t.lDemosMobile || t.lDemos || "Đề Mô"}</span>'
)

# Fix tab 3
content = content.replace(
    '<span className="whitespace-nowrap relative z-10">{data?.tab3Name || t.lAlbumsMobile || t.lAlbums || t(\'Tab 3 (Album/EP)\')}</span>',
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab3Name?.trim() || t.lAlbumsMobile || t.lAlbums || t(\'Tab 3 (Album/EP)\') || "Album/EP"}</span>'
)

# Fix "Về Tôi" in PublicAboutView
content = content.replace(
    '<h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-6">{t(\'Về Tôi\') || \'Về Tôi\'}</h2>',
    '<h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-6">{data?.artistName || t(\'Về Tôi\') || \'Về Tôi\'}</h2>'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed tabs and Về Tôi")
