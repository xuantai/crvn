with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab1Name?.trim() || t.lReleasedMobile || t.lReleased || "Ra Rồi"}</span>',
    '<span className="whitespace-nowrap relative z-10">{data?.tab1Name?.trim() || t.lReleasedMobile || t.lReleased || "Ra Rồi"}</span>'
)

content = content.replace(
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab2Name?.trim() || t.lDemosMobile || t.lDemos || "Đề Mô"}</span>',
    '<span className="whitespace-nowrap relative z-10">{data?.tab2Name?.trim() || t.lDemosMobile || t.lDemos || "Đề Mô"}</span>'
)

content = content.replace(
    '<span className="whitespace-nowrap relative z-10 hidden sm:inline-block md:inline-block lg:inline-block">{data?.tab3Name?.trim() || t.lAlbumsMobile || t.lAlbums || t(\'Tab 3 (Album/EP)\') || "Album/EP"}</span>',
    '<span className="whitespace-nowrap relative z-10">{data?.tab3Name?.trim() || t.lAlbumsMobile || t.lAlbums || t(\'Tab 3 (Album/EP)\') || "Album/EP"}</span>'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Removed hidden class from tabs")
