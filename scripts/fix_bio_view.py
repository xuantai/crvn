with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """className={`w-full mx-auto mb-20 relative z-10 px-6 sm:px-12 bg-white rounded-[2.5rem] py-12 shadow-2xl text-stone-900"""
replacement = """className={`w-full mx-auto mt-24 mb-20 relative z-10 px-6 sm:px-12 bg-white rounded-[2.5rem] py-12 shadow-2xl text-stone-900"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed PublicBioView margin")
