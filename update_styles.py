with open('src/App.tsx', 'r') as f:
    content = f.read()

# PublicAboutView container
content = content.replace(
    'className="w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-2xl relative z-10 text-stone-900"',
    'className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white"'
)

# Về Tôi heading
content = content.replace(
    '<h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-8">{t(\'Về Tôi\') || \'Về Tôi\'}</h2>',
    '<h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md mb-6">{t(\'Về Tôi\') || \'Về Tôi\'}</h2>'
)

# Intro text
content = content.replace(
    '<div className="mb-10 text-stone-600 text-xl leading-relaxed whitespace-pre-line font-medium">',
    '<div className="mb-6 text-white/90 text-xl leading-relaxed whitespace-pre-line font-medium drop-shadow-sm">'
)

# space-y-5 mb-10 -> space-y-3 mb-6
content = content.replace(
    '<div className="space-y-5 mb-10 text-lg">',
    '<div className="space-y-3 mb-6 text-lg">'
)

# Social container mb-10 -> mb-6
content = content.replace(
    '<div className="flex flex-wrap items-center gap-4 mb-10">',
    '<div className="flex flex-wrap items-center gap-4 mb-6">'
)

# Button style
content = content.replace(
    '<button onClick={onGoToVault} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 px-8 rounded-full shadow-[0_8px_16px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 text-lg cursor-pointer">',
    '<button onClick={onGoToVault} className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-10 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 text-lg cursor-pointer border border-white/20">'
)

# InfoField
content = content.replace(
    """function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex font-medium text-stone-700">
      <span className="font-bold w-28 shrink-0">{label}</span>
      <span className="mx-2">:</span>
      <span className="text-stone-500 flex-1">{value}</span>
    </div>
  );
}""",
    """function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex font-medium text-white/90 drop-shadow-sm">
      <span className="font-bold w-28 shrink-0 text-white">{label}</span>
      <span className="mx-2">:</span>
      <span className="text-white/80 flex-1">{value}</span>
    </div>
  );
}"""
)

# PublicBioView container
content = content.replace(
    'bg-white rounded-[2.5rem] py-12 shadow-2xl text-stone-900',
    'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] py-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white'
)

# PublicBioView headings
content = content.replace(
    '<h2 className="text-3xl font-black text-stone-900 mb-10 text-center tracking-tight">',
    '<h2 className="text-3xl font-black text-white drop-shadow-md mb-10 text-center tracking-tight">'
)

# Timeline lines
content = content.replace(
    'before:bg-stone-200',
    'before:bg-white/20'
)

# Timeline dots border
content = content.replace(
    'border-[3px] border-white',
    'border-[3px] border-white/30 backdrop-blur-md'
)

# Timeline title
content = content.replace(
    '<h3 className="font-bold text-stone-900 text-lg sm:text-xl">',
    '<h3 className="font-bold text-white drop-shadow-sm text-lg sm:text-xl">'
)

# Timeline description
content = content.replace(
    '<p className="text-stone-500 text-sm sm:text-base leading-relaxed whitespace-pre-line">',
    '<p className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Applied styles")
