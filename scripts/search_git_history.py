import subprocess

keywords = [
    "Phan Bội Châu",
    "Phan Boi Chau",
    "Suzuki",
    "Bunkyo",
    "Hoàng Tử Quỷ",
    "Vinhomes Ca",
    "Running"
]

def search_git_history():
    print("=== SEARCHING LOCAL GIT LOG & COMMITS ===")
    for kw in keywords:
        try:
            cmd = f'git log -S "{kw}" -p --all'
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=r"f:\code\git\crvn")
            if res.stdout and len(res.stdout.strip()) > 0:
                print(f"🔥 FOUND MATCH FOR KEYWORD '{kw}' IN GIT LOG:")
                print(res.stdout[:2000])
            else:
                print(f"No git history match for '{kw}'")
        except Exception as e:
            print(f"Error searching git for '{kw}':", e)

if __name__ == "__main__":
    search_git_history()
