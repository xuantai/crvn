const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const insertVouchersStore = `
const VOUCHERS_FILE = path.join(process.cwd(), 'vouchers.json');
let vouchers: any[] = [];
try {
  if (fsSync.existsSync(VOUCHERS_FILE)) {
    vouchers = JSON.parse(fsSync.readFileSync(VOUCHERS_FILE, 'utf-8'));
  }
} catch (e) { console.error('Error loading vouchers', e); }

async function saveVouchers() {
  await fs.writeFile(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2), 'utf-8');
  if (!isFirestoreDisabled && (landingConfig as any).cloudSyncEnabled !== false) {
    try {
      const docRef = doc(db, 'app_data', 'vouchers');
      await setDoc(docRef, { vouchers });
    } catch (e) {}
  }
}
`;

// Insert after ARTISTS_FILE declaration
code = code.replace(
  "const SUBSCRIBERS_FILE = path.join(process.cwd(), 'subscribers.json');",
  "const SUBSCRIBERS_FILE = path.join(process.cwd(), 'subscribers.json');\n" + insertVouchersStore
);

const insertVoucherApis = `
  app.get('/api/acp/vouchers', async (req, res) => {
    if (!isRequestMasterAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    res.json(vouchers);
  });

  app.post('/api/acp/vouchers/create', express.json(), async (req, res) => {
    if (!isRequestMasterAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { code, increaseSongs, increaseTemplates, vipMonths } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    if (vouchers.some(v => v.code === code)) return res.status(400).json({ error: 'Code already exists' });
    const v = {
      id: crypto.randomBytes(8).toString('hex'),
      code,
      increaseSongs: Number(increaseSongs) || 0,
      increaseTemplates: Number(increaseTemplates) || 0,
      vipMonths: Number(vipMonths) || 0,
      usedBy: [],
      createdAt: new Date().toISOString()
    };
    vouchers.push(v);
    await saveVouchers();
    res.json(v);
  });

  app.post('/api/acp/vouchers/delete', express.json(), async (req, res) => {
    if (!isRequestMasterAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    vouchers = vouchers.filter(v => v.id !== id);
    await saveVouchers();
    res.json({ success: true });
  });

  app.post('/api/admin/vouchers/redeem', express.json(), async (req: any, res) => {
    if (!isRequestAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { code } = req.body;
    const v = vouchers.find(v => v.code === code);
    if (!v) return res.status(404).json({ error: 'Mã không tồn tại' });
    if (v.usedBy.includes(req.artist.username)) return res.status(400).json({ error: 'Bạn đã sử dụng mã này rồi' });
    
    // Apply voucher
    v.usedBy.push(req.artist.username);
    await saveVouchers();

    const artist = artists.find(a => a.username === req.artist.username);
    if (artist) {
      if (v.increaseSongs > 0) {
        artist.maxSongs = (artist.maxSongs || 0) + v.increaseSongs;
      }
      if (v.increaseTemplates > 0) {
        artist.maxTemplates = (artist.maxTemplates || 0) + v.increaseTemplates;
      }
      if (v.vipMonths > 0) {
        artist.roleId = 'vip';
        const currentExp = artist.vipExpiry ? new Date(artist.vipExpiry).getTime() : Date.now();
        const newExp = new Date(Math.max(currentExp, Date.now()));
        newExp.setMonth(newExp.getMonth() + v.vipMonths);
        artist.vipExpiry = newExp.toISOString();
      }
      await saveArtists(artists);
    }
    res.json({ success: true, message: 'Áp dụng mã thành công!' });
  });
`;

code = code.replace(
  "app.get('/api/acp/artists', async (req, res) => {",
  insertVoucherApis + "\n  app.get('/api/acp/artists', async (req, res) => {"
);

fs.writeFileSync('server.ts', code);
