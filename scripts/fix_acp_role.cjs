const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

// Remove membershipTier state
code = code.replace(
  "const [artistRoleId, setArtistRoleId] = useState('');\n  const [artistMembershipTier, setArtistMembershipTier] = useState('');",
  "const [artistRoleId, setArtistRoleId] = useState('');\n  const [artistMaxSongs, setArtistMaxSongs] = useState<number | ''>('');"
);

code = code.replace(
  "setArtistRoleId((artist as any).roleId || '');\n    setArtistMembershipTier((artist as any).membershipTier || '');",
  "setArtistRoleId((artist as any).roleId || '');\n    setArtistMaxSongs((artist as any).maxSongs || '');"
);

code = code.replace(
  "setArtistRoleId('');\n    setArtistMembershipTier('');",
  "setArtistRoleId('');\n    setArtistMaxSongs('');"
);

code = code.replace(
  "roleId: artistRoleId,\n          membershipTier: artistMembershipTier",
  "roleId: artistRoleId,\n          maxSongs: artistMaxSongs === '' ? null : artistMaxSongs"
);

// We need to replace it again for update endpoint
code = code.replace(
  "roleId: artistRoleId,\n          membershipTier: artistMembershipTier",
  "roleId: artistRoleId,\n          maxSongs: artistMaxSongs === '' ? null : artistMaxSongs"
);


fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
