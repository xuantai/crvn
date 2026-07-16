import sys

with open("src/components/HelpPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target1 = """import { ChevronRight, Settings, LogIn, FileText, Layout, Copy, Repeat, Lock, Link as LinkIcon, Save, Eye, Plus, ChevronLeft, Globe } from 'lucide-react';
import { LanguageContext } from '../App';"""

repl1 = """import { ChevronRight, Settings, LogIn, FileText, Layout, Copy, Repeat, Lock, Link as LinkIcon, Save, Eye, Plus, ChevronLeft, Globe } from 'lucide-react';
import { LanguageContext, DemoPlayer } from '../App';
import { TEMPLATES, DEFAULT_VI_NAMES } from '../templates';"""


target2 = """  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isLoading, setIsLoading] = useState(true);"""

repl2 = """  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(TEMPLATES[0].id);"""

target3 = """                  {['Cheerful (Warm)', 'Energetic (Vibrant)', 'Sad (Deep)', 'Relaxed (Gentle)'].map((theme, idx) => ("""

repl3 = """                  {TEMPLATES.map((t, idx) => ("""

target4 = """                    <div key={theme} className="p-4 bg-white border border-neutral-200 rounded-xl cursor-pointer hover:border-black transition-colors flex items-center justify-between group">
                      <div className="font-bold text-neutral-800">{theme}</div>"""

repl4 = """                    <div key={t.id} onClick={() => setSelectedTheme(t.id)} className={`p-4 bg-white border rounded-xl cursor-pointer transition-colors flex items-center justify-between group ${selectedTheme === t.id ? 'border-black ring-1 ring-black' : 'border-neutral-200 hover:border-black'}`}>
                      <div className="font-bold text-neutral-800">{DEFAULT_VI_NAMES[t.id] ? DEFAULT_VI_NAMES[t.id] : t.name}</div>"""


if target1 in content and target2 in content and target3 in content and target4 in content:
    content = content.replace(target1, repl1)
    content = content.replace(target2, repl2)
    content = content.replace(target3, repl3)
    content = content.replace(target4, repl4)
    with open("src/components/HelpPage.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("HelpPage patched successfully")
else:
    print("Could not find targets in HelpPage")
