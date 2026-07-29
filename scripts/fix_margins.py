import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix PublicAboutView
content = re.sub(
    r'className="w-full max-w-5xl mx-auto bg-white rounded-\[2\.5rem\] p-8 sm:p-12 mb-20 shadow-2xl relative z-10 text-stone-900"',
    r'className="w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-2xl relative z-10 text-stone-900"',
    content
)

# Fix PublicBioView
content = re.sub(
    r'className="w-full max-w-5xl mx-auto bg-white rounded-\[2\.5rem\] p-8 sm:p-12 mb-20 shadow-2xl relative z-10"',
    r'className="w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-2xl relative z-10"',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed margins for About and Bio views")
