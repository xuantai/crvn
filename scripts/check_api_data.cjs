async function testApi() {
  const urls = [
    'https://acxuantai.bbb.bz/api/data',
    'https://chorus.vn/api/data?artist=acxuantai'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ API [${url}] returned:`);
        console.log('   profile:', json.profile);
        console.log('   biography:', json.biography);
      } else {
        console.log(`❌ API [${url}] status:`, res.status);
      }
    } catch (e) {
      console.log(`⚠️ API error [${url}]:`, e.message);
    }
  }
}

testApi();
