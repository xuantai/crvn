const punycode = require('punycode');
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
      
      const uni1_nfc = punycode.toUnicode(c1).normalize('NFC');
      const uni1_nfd = punycode.toUnicode(c1).normalize('NFD');
      const uni2_nfc = punycode.toUnicode(c2).normalize('NFC');
      const uni2_nfd = punycode.toUnicode(c2).normalize('NFD');
      
      const set1 = new Set([c1, ascii1_nfc, ascii1_nfd, uni1_nfc, uni1_nfd]);
      const set2 = new Set([c2, ascii2_nfc, ascii2_nfd, uni2_nfc, uni2_nfd]);
      
      for (const item of set1) {
        if (set2.has(item)) return true;
      }
    } catch (e) {}
    return false;
}
console.log(domainsMatch('tài.vn', 'xn--ti-jia.vn'));
console.log(domainsMatch('tài.vn', 'tài.vn'));
console.log(domainsMatch('tài.vn', 'xn--ti-kia.vn'));
