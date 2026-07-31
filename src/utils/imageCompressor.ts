export const compressImageInBrowser = async (file: File, maxWidth = 1920, maxHeight = 1920): Promise<File> => {
  if (!file.type || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxWidth && height <= maxHeight && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      let canvasType = 'image/jpeg';
      let quality = 0.85;
      if (file.type === 'image/png' || file.type === 'image/webp') {
        canvasType = file.type;
      }

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name, {
              type: canvasType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        canvasType,
        quality
      );
    };
    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
