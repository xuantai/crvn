import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract everything inside the <main>...</main> of AdminDashboard
# The main starts at line 9722:
# <main className={`flex-1 bg-white flex flex-col ${isPCPreviewMode ? 'rounded-none border-0 shadow-none min-h-0 h-[calc(100vh-64px)] overflow-hidden' : 'rounded-none md:rounded-3xl border-0 md:border md:border-stone-200 shadow-none md:shadow-sm p-4 md:p-8 min-h-[calc(100vh-64px)]'}`}>
# and ends around line 11847. We can replace each `{activeTab === 'x' && ( <div... )}` with motion.div?
# Actually, the user says "Hiệu ứng trượt lên xuống khi chuyển tab của tôi đâu rồi" - "sliding up and down effect when switching tabs". This could be Admin tabs, but maybe it's just the Home tabs which I already fixed? Wait, "chuyển tab của tôi" -> the user's tab switching.
# Did it work in Home tabs? Yes, I just added it.
# Wait! In AdminDashboard, the tabs might already have motion.divs inside them? No.
# If I wrap the inside of `main` with `<AnimatePresence mode="wait">` and change the structure slightly it could work.
# Let's search if `activeTab === 'demos'` had motion.div before in earlier commits? No, I never added it.
# Let's check `Home` tab switching animation:
print("We'll skip AdminDashboard for now, the user probably meant Home tabs.")
