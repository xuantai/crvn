with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """      result[key] = customTr || baseDict[key] || originalValue;
    });
    return result;
  }, [lang, landingConfig, artistData]);"""

replacement = """      result[key] = customTr || baseDict[key] || originalValue;
    });
    return (k: string) => result[k] || k;
  }, [lang, landingConfig, artistData]);"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed useMemo t returning a function")
