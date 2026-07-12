import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix PublicBioView line styling
content = content.replace(
    "${hasEdu && hasExp ? 'md:before:ml-[1.125rem] md:before:-translate-x-px' : 'md:before:mx-auto md:before:translate-x-0'}",
    "md:before:ml-[1.125rem] md:before:-translate-x-px"
)

# Fix TimelineItem to always act like isSplit=true, so it's always left aligned
content = content.replace(
    'isSplit={hasEdu && hasExp}',
    'isSplit={true}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed PublicBioView left alignment")
