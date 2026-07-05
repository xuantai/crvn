const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const resolveACP = `  app.post('/api/acp/tickets/:id/resolve', async (req, res) => {`;
const reopenACP = `  app.post('/api/acp/tickets/:id/reopen', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await loadTickets();
    const ticketIdx = tickets.findIndex(t => t.id === req.params.id);
    if (ticketIdx === -1) {
      return res.status(404).json({ error: 'Không tìm thấy ticket!' });
    }

    const ticket = tickets[ticketIdx];
    ticket.status = 'open';
    ticket.messages.push({
      id: crypto.randomBytes(8).toString('hex'),
      sender: 'admin',
      senderName: 'Hệ thống',
      text: 'Admin hệ thống đã mở lại ticket này.',
      createdAt: new Date().toISOString()
    });

    await saveTickets(tickets);
    if (artists.length === 0) {
      await loadArtists();
    }
    res.json({ success: true, ticket: mapTicket(ticket) });
  });

  app.post('/api/acp/tickets/:id/resolve', async (req, res) => {`;

if (code.includes(resolveACP)) {
  code = code.replace(resolveACP, reopenACP);
  console.log('Added ACP reopen');
}

const resolveAdmin = `app.post('/api/admin/tickets/:id/resolve', async (req: any, res) => {`;
const reopenAdmin = `app.post('/api/admin/tickets/:id/reopen', async (req: any, res) => {
  if (!isRequestAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await loadTickets();
  const ticketIdx = tickets.findIndex(t => t.id === req.params.id);
  if (ticketIdx === -1) {
    return res.status(404).json({ error: 'Không tìm thấy ticket!' });
  }

  const ticket = tickets[ticketIdx];
  const isReporter = req.artist.username === ticket.reporterArtist;
  const isSource = req.artist.username === ticket.sourceArtist;
  const isAdmin = req.artist.username === 'acxuantai';

  if (!isAdmin) {
    return res.status(403).json({ error: 'Chỉ Admin mới có quyền mở lại ticket!' });
  }

  ticket.status = 'open';
  ticket.messages.push({
    sender: 'admin',
    senderName: 'Hệ thống',
    text: 'Admin hệ thống đã mở lại ticket này.',
    createdAt: new Date().toISOString()
  });

  await saveTickets(tickets);
  if (artists.length === 0) {
    await loadArtists();
  }
  res.json({ success: true, ticket: mapTicket(ticket) });
});

app.post('/api/admin/tickets/:id/resolve', async (req: any, res) => {`;

if (code.includes(resolveAdmin)) {
  code = code.replace(resolveAdmin, reopenAdmin);
  console.log('Added Admin reopen');
}

fs.writeFileSync('server.ts', code);
