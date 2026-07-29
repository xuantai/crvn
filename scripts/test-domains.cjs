const punycode = require('punycode/');

  const normalizeToAscii = (domain) => {
    try {
      const clean = (domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
      return punycode.toASCII(clean.normalize('NFC'));
    } catch (e) {
      return (domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
    }
  };

  const domainsMatch = (d1, d2) => {
    if (!d1 || !d2) return false;
    const clean = (d) => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
    const c1 = clean(d1);
    const c2 = clean(d2);
    if (c1 === c2) return true;
    try {
      const ascii1_nfc = punycode.toASCII(c1.normalize('NFC'));
      const ascii1_nfd = punycode.toASCII(c1.normalize('NFD'));
      const ascii2_nfc = punycode.toASCII(c2.normalize('NFC'));
      const ascii2_nfd = punycode.toASCII(c2.normalize('NFD'));
      if (ascii1_nfc === ascii2_nfc || ascii1_nfc === ascii2_nfd || ascii1_nfd === ascii2_nfc || ascii1_nfd === ascii2_nfd) return true;
      
      const uni1_nfc = punycode.toUnicode(c1).normalize('NFC');
      const uni1_nfd = punycode.toUnicode(c1).normalize('NFD');
      const uni2_nfc = punycode.toUnicode(c2).normalize('NFC');
      const uni2_nfd = punycode.toUnicode(c2).normalize('NFD');
      if (uni1_nfc === uni2_nfc || uni1_nfc === uni2_nfd || uni1_nfd === uni2_nfc || uni1_nfd === uni2_nfd) return true;
    } catch (e) {}
    
    return normalizeToAscii(c1) === normalizeToAscii(c2);
  };
  
console.log(domainsMatch("tài.vn", "xn--ti-kia.vn"));
