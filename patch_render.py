import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# render AdminAboutEdit and AdminBioEdit
active_tab_renders = """
          {activeTab === 'about' && (
             <AdminAboutEdit data={data} t={t} onSave={handleCustomSave} />
          )}
          {activeTab === 'bio' && (
             <AdminBioEdit data={data} t={t} onSave={handleCustomSave} />
          )}
"""
content = content.replace("{activeTab === 'profile' && (", active_tab_renders + "\n          {activeTab === 'profile' && (")

# render AdminMenuEdit inside profile tab, before the </form> or after?
# The request: "Dưới mục Cài Đặt cho thêm: Quản lý Menu". So it's below the settings.
# Find `</form>` for the profile form, and insert it after `</form>`.
menu_render = "\n              <AdminMenuEdit data={data} t={t} onSave={handleCustomSave} />\n"
# There are multiple </form>. I'll find the specific text for `globalBaseUrl` and `</form>`.
profile_end_block = """                  <p className="text-xs text-stone-500">{t("Sẽ nối với username của bạn. Ví dụ:")} https://chorus.vn/username</p>
                </div>
                
                <button type="submit" className="bg-stone-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-stone-800 transition-colors w-full">{t("Lưu cài đặt")}</button>
              </form>"""
              
if profile_end_block in content:
    content = content.replace(profile_end_block, profile_end_block + menu_render)
else:
    # let's just search for {t("Lưu cài đặt")}</button>
    content = re.sub(r'({t\("Lưu cài đặt"\)}</button>\s*</form>)', r'\1' + menu_render, content, count=1)


with open('src/App.tsx', 'w') as f:
    f.write(content)
