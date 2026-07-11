with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

idx = 394293
brands_idx = content.find('brands', idx)
print(f"brands_idx: {brands_idx}")

# Let's print the chunk of text from the </div> at line 8080 up to just before the brands button!
close_div_idx = content.find('</div>', idx)

# We want to trace exactly what is before the brands button.
# Let's search backwards from brands_idx to find the start of its button.
btn_start_idx = content.rfind('<button', idx, brands_idx)
print(f"btn_start_idx: {btn_start_idx}")

chunk = content[close_div_idx : btn_start_idx]
print(f"Chunk to replace: {repr(chunk)}")
