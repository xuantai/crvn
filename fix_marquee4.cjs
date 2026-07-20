const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const newMarquee = `function MarqueeText({ children, className }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const tWidth = textRef.current.scrollWidth;
        if (tWidth > cWidth + 2) {
          setIsOverflowing(true);
          setScrollAmount(tWidth - cWidth);
        } else {
          setIsOverflowing(false);
          setScrollAmount(0);
        }
      }
    };

    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 500);
    
    let observer;
    if (textRef.current) {
      observer = new ResizeObserver(checkOverflow);
      observer.observe(textRef.current);
    }
    if (containerRef.current) {
       const containerObserver = new ResizeObserver(checkOverflow);
       containerObserver.observe(containerRef.current);
       return () => {
         clearTimeout(timeoutId);
         if (observer) observer.disconnect();
         containerObserver.disconnect();
       };
    }

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [children]);

  return (
    <div ref={containerRef} className={\`w-full overflow-hidden flex \${className || ''}\`}>
      {isOverflowing ? (
        <motion.div
          className="whitespace-nowrap inline-flex items-center shrink-0 w-max pr-8"
          animate={{ x: [0, -scrollAmount - 32, 0] }}
          transition={{ duration: Math.max(scrollAmount * 0.03, 3), ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
        >
          {children}
        </motion.div>
      ) : (
        <div ref={textRef} className="whitespace-nowrap inline-flex items-center shrink-0 w-max max-w-full text-ellipsis overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/function MarqueeText\(\{ children, className \}: \{ children: React\.ReactNode, className\?: string \}\) \{[\s\S]*?(?=\n\}\n)/, newMarquee.trim().replace(/\n\}\n$/, ''));
// Wait, the regex might be tricky. Let's just replace the whole function using exact string match if possible.
// Actually, it's safer to use sed or just a simple string replacement since we know the exact content.

