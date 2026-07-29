import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Inject <AnimatePresence mode="wait">
content = content.replace(
    '<div className="overflow-x-auto min-h-[300px]">\n                {demosSubTab === \'landing_pages\' && (() => {',
    '<div className="overflow-x-auto min-h-[300px]">\n<AnimatePresence mode="wait">\n                {demosSubTab === \'landing_pages\' && (() => {'
)

# 2. Inject closing </AnimatePresence>
content = content.replace(
    '})()}\n              </div>\n            </div>\n            </motion.div>\n          )}\n\n          {activeTab === \'profile\'',
    '})()}\n</AnimatePresence>\n              </div>\n            </div>\n            </motion.div>\n          )}\n\n          {activeTab === \'profile\''
)

# 3. Replace each subtab with motion.div
subtabs = ['landing_pages', 'released', 'demos', 'brands', 'drafts', 'playlists', 'trash']
for tab in subtabs:
    content = content.replace(
        f"{{demosSubTab === '{tab}' && (() => {{",
        f"{{demosSubTab === '{tab}' && (() => {{\nreturn (\n<motion.div key=\"{tab}\" initial={{{{ opacity: 0, y: 15 }}}} animate={{{{ opacity: 1, y: 0 }}}} exit={{{{ opacity: 0, y: -15 }}}} transition={{{{ type: 'spring', stiffness: 300, damping: 25 }}}} className=\"w-full\">\n{{(() => {{"
    )
    # the end of the block needs to close motion.div
    # each block ends with })\(\)\}
    # but wait, this is nested immediately! So the inner function ends, then we close motion.div
    # Let's write the replace for the end of the block... it's too risky if we just replace universally.
