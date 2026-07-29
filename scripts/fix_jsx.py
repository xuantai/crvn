import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_block = """          )}
        </div>
      </section>


      {/* Main Content */}"""

good_block = """          )}
        </div>
      </section>
      </>
      )}

      {/* Main Content */}"""

content = content.replace(bad_block, good_block)

with open('src/App.tsx', 'w') as f:
    f.write(content)
