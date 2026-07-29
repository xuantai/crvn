with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add AnimatePresence
content = content.replace(
    '<div className="overflow-x-auto min-h-[300px]">',
    '<div className="overflow-x-auto min-h-[300px]">\n<AnimatePresence mode="wait">'
)

subtabs = ['landing_pages', 'released', 'demos', 'brands', 'drafts', 'playlists', 'trash']
for tab in subtabs:
    search_str = f"{{demosSubTab === '{tab}' && (() => {{"
    replace_str = f"{{demosSubTab === '{tab}' && (<motion.div key=\"{tab}\" initial={{{{ opacity: 0, y: 15 }}}} animate={{{{ opacity: 1, y: 0 }}}} exit={{{{ opacity: 0, y: -15 }}}} transition={{{{ type: 'spring', stiffness: 300, damping: 25 }}}} className=\"w-full\">{{(() => {{"
    content = content.replace(search_str, replace_str)

# The corresponding `})()}` lines are at 10046, 10138, 10234, 10334, 10413, 10490, 10562.
# Instead of guessing, we can split the file into lines and replace exactly those occurrences.
# Let's find the lines that contain `})()}` and are between where `<div className="overflow-x-auto min-h-[300px]">` is and where the `activeTab === 'profile'` starts.

lines = content.split('\n')
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<div className="overflow-x-auto min-h-[300px]">' in line:
        start_idx = i
    if "{activeTab === 'profile'" in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    for i in range(start_idx, end_idx):
        if '})()' in lines[i]:
            lines[i] = lines[i].replace('})()}', '})()}</motion.div>)}')
            
    # Also we need to close </AnimatePresence> right before `</div>` that closes this section.
    # The section closes at 10563 normally, which is the line after the last `})()}</motion.div>)}`
    # Let's find the last `})()}</motion.div>)}` in this block.
    last_iife_close = -1
    for i in range(end_idx, start_idx, -1):
        if '})()}</motion.div>)}' in lines[i]:
            last_iife_close = i
            break
            
    if last_iife_close != -1:
        lines.insert(last_iife_close + 1, '</AnimatePresence>')

content = '\n'.join(lines)

with open('src/App.tsx', 'w') as f:
    f.write(content)

