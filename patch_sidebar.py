import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

active_tab_defs = """            const isProfileActive = activeTab === 'profile';
            const isAboutActive = activeTab === 'about';
            const isBioActive = activeTab === 'bio';"""

content = content.replace("            const isProfileActive = activeTab === 'profile';", active_tab_defs)

# find the profile button and insert after it
# First find the import of 'User' or 'FileText' or something to use as icons.
# We will use 'User' and 'FileText' or 'BookOpen' from lucide-react. Let's see if they exist or import them later.
