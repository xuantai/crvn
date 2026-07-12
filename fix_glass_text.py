with open('src/App.tsx', 'r') as f:
    content = f.read()

# PublicAboutView
content = content.replace(
    'className="w-full max-w-5xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-2xl relative z-10 text-stone-900"',
    'className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white"'
)
content = content.replace(
    '<h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-6">{data?.artistName || t(\'Về Tôi\') || \'Về Tôi\'}</h2>',
    '<h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md mb-6">{data?.artistName || t(\'Về Tôi\') || \'Về Tôi\'}</h2>'
)
content = content.replace(
    '<h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-6">',
    '<h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md mb-6">'
)
content = content.replace(
    '<div className="mb-6 text-stone-700 text-xl leading-relaxed whitespace-pre-line font-medium">',
    '<div className="mb-6 text-white/90 text-xl leading-relaxed whitespace-pre-line font-medium drop-shadow-sm">'
)
content = content.replace(
    """function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex font-medium text-stone-700">
      <span className="font-bold w-28 shrink-0 text-stone-900">{label}</span>
      <span className="mx-2">:</span>
      <span className="text-stone-600 flex-1">{value}</span>
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

# PublicBioView
content = content.replace(
    'bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] py-12 shadow-2xl text-stone-900',
    'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] py-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white'
)
content = content.replace(
    '<h2 className="text-3xl font-black text-stone-900 mb-10 text-center tracking-tight">',
    '<h2 className="text-3xl font-black text-white drop-shadow-md mb-10 text-center tracking-tight">'
)
content = content.replace(
    '<h3 className="font-bold text-stone-900 text-lg sm:text-xl">',
    '<h3 className="font-bold text-white drop-shadow-sm text-lg sm:text-xl">'
)
content = content.replace(
    '<p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">',
    '<p className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">'
)
content = content.replace(
    'before:bg-stone-300',
    'before:bg-white/20'
)
content = content.replace(
    'border-[3px] border-white',
    'border-[3px] border-white/30 backdrop-blur-md'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Restored white glass text")
