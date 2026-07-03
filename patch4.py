import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

old_link = """                            <a 
                              href={`/${artist.extension}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-purple-400 hover:underline flex items-center gap-1 font-medium group"
                            >
                              /{artist.extension}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>"""

new_link = """                            <div className="flex flex-col gap-1">
                              <a 
                                href={`/${artist.extension}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                chorus.vn/{artist.extension}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <a 
                                href={`https://${artist.extension}.chorus.vn`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-teal-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                {artist.extension}.chorus.vn
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </div>"""

code = code.replace(old_link, new_link)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)

