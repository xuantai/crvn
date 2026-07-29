import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# For vi
content = content.replace('"100 mục": "100 mục"\n    },', '"100 mục": "100 mục",\n      "10 bài": "10 bài",\n      "20 bài": "20 bài",\n      "50 bài": "50 bài",\n      "100 bài": "100 bài"\n    },')

# For en
content = content.replace('"100 mục": "100 items"\n    },', '"100 mục": "100 items",\n      "10 bài": "10 songs",\n      "20 bài": "20 songs",\n      "50 bài": "50 songs",\n      "100 bài": "100 songs"\n    },')

# For ko
content = content.replace('"100 mục": "100개 항목"\n    },', '"100 mục": "100개 항목",\n      "10 bài": "10곡",\n      "20 bài": "20곡",\n      "50 bài": "50곡",\n      "100 bài": "100곡"\n    },')

# For ja
content = content.replace('"100 mục": "100項目"\n    },', '"100 mục": "100項目",\n      "10 bài": "10曲",\n      "20 bài": "20曲",\n      "50 bài": "50曲",\n      "100 bài": "100曲"\n    },')

# For th
content = content.replace('"100 mục": "100 รายการ"\n    },', '"100 mục": "100 รายการ",\n      "10 bài": "10 เพลง",\n      "20 bài": "20 เพลง",\n      "50 bài": "50 เพลง",\n      "100 bài": "100 เพลง"\n    },')

# For zh
content = content.replace('"100 mục": "100项"\n    }', '"100 mục": "100项",\n      "10 bài": "10首歌",\n      "20 bài": "20首歌",\n      "50 bài": "50首歌",\n      "100 bài": "100首歌"\n    }')

with open('src/App.tsx', 'w') as f:
    f.write(content)
