import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to wrap the fragment with AnimatePresence
# return (
#   <>
#     {totalItems === 0 ? (
# ...

content = content.replace(
    'return (\n              <>\n                {totalItems === 0 ? (',
    'return (\n              <AnimatePresence mode="wait">\n                {totalItems === 0 ? ('
)

# And replace the closing fragment at the end of the return statement
content = content.replace(
    '                  </motion.div>\n                )}\n              </>\n            );',
    '                  </motion.div>\n                )}\n              </AnimatePresence>\n            );'
)

# Also we need to add the exit animation to empty state:
content = content.replace(
    'animate={{ opacity: 1, y: 0 }}\n                    transition={{ type: "spring", stiffness: 100, damping: 15 }}',
    'animate={{ opacity: 1, y: 0 }}\n                    exit={{ opacity: 0, y: -15 }}\n                    transition={{ type: "spring", stiffness: 100, damping: 15 }}'
)

# And to the list:
content = content.replace(
    'key={activeListTab}\n                    variants={{\n                      hidden: { opacity: 0 },\n                      show: {\n                        opacity: 1,\n                        transition: {\n                          staggerChildren: 0.04\n                        }\n                      }\n                    }}',
    'key={activeListTab}\n                    variants={{\n                      hidden: { opacity: 0, y: 15 },\n                      show: {\n                        opacity: 1, y: 0,\n                        transition: {\n                          staggerChildren: 0.04\n                        }\n                      },\n                      exit: { opacity: 0, y: -15 }\n                    }}'
)
content = content.replace(
    'initial="hidden"\n                    animate="show"\n                    className="grid grid-cols-1 md:grid-cols-2 gap-4"',
    'initial="hidden"\n                    animate="show"\n                    exit="exit"\n                    className="grid grid-cols-1 md:grid-cols-2 gap-4"'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed tabs animation!")
