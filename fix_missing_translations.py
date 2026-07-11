import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# For vi
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "Tất cả bài hát đều đã ở trong playlist này rồi."\n    },', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "Tất cả bài hát đều đã ở trong playlist này rồi.",\n      "Danh sách Playlist": "Danh sách Playlist",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc",\n      "10 mục": "10 mục",\n      "20 mục": "20 mục",\n      "50 mục": "50 mục",\n      "100 mục": "100 mục"\n    },')

# For en
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "All songs are already in this playlist."\n    },', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "All songs are already in this playlist.",\n      "Danh sách Playlist": "Playlist List",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "Create, prioritize and edit playlists",\n      "10 mục": "10 items",\n      "20 mục": "20 items",\n      "50 mục": "50 items",\n      "100 mục": "100 items"\n    },')

# For ko
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "모든 노래가 이미 이 재생목록에 있습니다."\n    },', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "모든 노래가 이미 이 재생목록에 있습니다.",\n      "Danh sách Playlist": "재생목록 목록",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "재생목록 생성, 우선순위 지정 및 편집",\n      "10 mục": "10개 항목",\n      "20 mục": "20개 항목",\n      "50 mục": "50개 항목",\n      "100 mục": "100개 항목"\n    },')

# For ja
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "すべての曲がすでにこのプレイリストに含まれています。"\n    },', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "すべての曲がすでにこのプレイリストに含まれています。",\n      "Danh sách Playlist": "プレイリスト一覧",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "プレイリストの作成、優先順位付け、編集",\n      "10 mục": "10項目",\n      "20 mục": "20項目",\n      "50 mục": "50項目",\n      "100 mục": "100項目"\n    },')

# For th
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "เพลงทั้งหมดอยู่ในเพลย์ลิสต์นี้แล้ว"\n    },', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "เพลงทั้งหมดอยู่ในเพลย์ลิสต์นี้แล้ว",\n      "Danh sách Playlist": "รายการเพลย์ลิสต์",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "สร้าง จัดลำดับความสำคัญ และแก้ไขเพลย์ลิสต์",\n      "10 mục": "10 รายการ",\n      "20 mục": "20 รายการ",\n      "50 mục": "50 รายการ",\n      "100 mục": "100 รายการ"\n    },')

# For zh
content = content.replace('"Tất cả bài hát đều đã ở trong playlist này rồi.": "所有歌曲均已在此播放列表中。"\n    }', '"Tất cả bài hát đều đã ở trong playlist này rồi.": "所有歌曲均已在此播放列表中。",\n      "Danh sách Playlist": "播放列表",\n      "Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc": "创建、优先排序和编辑播放列表",\n      "10 mục": "10项",\n      "20 mục": "20项",\n      "50 mục": "50项",\n      "100 mục": "100项"\n    }')

with open('src/App.tsx', 'w') as f:
    f.write(content)
