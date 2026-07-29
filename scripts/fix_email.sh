sed -i '3137,3145c\
    const data = await loadData((req as any).artist?.username);\
    if(data) {\
      data.adminEmail = email.toLowerCase().trim();\
      await saveData(data);\
    }' server.ts
npm run build
