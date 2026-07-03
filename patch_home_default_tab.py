import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

injection = """  useEffect(() => {
    if (data && data.demos) {
      const hasReleased = data.demos.some(d => (d.status === 'public' || d.linkType === 'indirect') && !d.isDraft && (d.isReleased || d.linkType === 'indirect'));
      const hasDemos = data.demos.some(d => (d.status === 'public' || d.linkType === 'indirect') && !d.isDraft && (!d.isReleased && d.linkType !== 'indirect'));
      if (!hasReleased && hasDemos && activeListTab === 'released') {
        setActiveListTab('demos');
      }
    }
  }, [data, activeListTab]);

  const handleSearchChange"""

code = code.replace("  const handleSearchChange", injection)

with open('src/App.tsx', 'w') as f:
    f.write(code)

