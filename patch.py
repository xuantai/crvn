import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = """  const [toast, setToast] = useState('');
  
  // Report Popup State inside DemoPlayer"""

replace1 = """  const [toast, setToast] = useState('');

  // Drag-to-scroll for mobile preview on PC
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTopPos, setScrollTopPos] = useState(0);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTopPos(scrollRef.current.scrollTop);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    scrollRef.current.scrollTop = scrollTopPos - walk;
  };
  
  // Report Popup State inside DemoPlayer"""

target2 = """  return (
    <div 
      className={`min-h-[100dvh] min-w-full px-4 py-8 ${themeClasses} transition-colors duration-1000 relative ${forceMobile ? 'overflow-hidden' : ''}`}
      style={{ backgroundColor: customConfig?.bgColor || undefined }}
    >"""

replace2 = """  return (
    <div 
      ref={scrollRef}
      onMouseDown={forceMobile ? handleMouseDown : undefined}
      onMouseLeave={forceMobile ? handleMouseLeave : undefined}
      onMouseUp={forceMobile ? handleMouseUp : undefined}
      onMouseMove={forceMobile ? handleMouseMove : undefined}
      className={`min-h-[100dvh] min-w-full px-4 py-8 ${themeClasses} transition-colors duration-1000 relative ${forceMobile ? 'overflow-y-auto overflow-x-hidden no-scrollbar select-none' : ''}`}
      style={{ backgroundColor: customConfig?.bgColor || undefined }}
    >"""

if target1 in content:
    content = content.replace(target1, replace1)
    print("Replaced 1")
else:
    print("Target 1 not found")

if target2 in content:
    content = content.replace(target2, replace2)
    print("Replaced 2")
else:
    print("Target 2 not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)
