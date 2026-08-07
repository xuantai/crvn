import { getAdminToken, getArtistExtensionFromUrl } from "./shared";

// ============================================
// Admin-only utilities extracted from App.tsx
// ============================================
export const formatFileName = (name: string, maxLen = 22) => {
  if (!name || name.length <= maxLen) return name;
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) {
    return name.slice(0, maxLen - 3) + '...';
  }
  const ext = name.slice(dotIndex);
  const baseName = name.slice(0, dotIndex);
  const charsToKeep = maxLen - ext.length - 3;
  if (charsToKeep <= 4) {
    return name.slice(0, maxLen - 3) + '...';
  }
  const half = Math.floor(charsToKeep / 2);
  const start = baseName.slice(0, half);
  const end = baseName.slice(-half);
  return `${start}...${end}${ext}`;
};

export const compressImageInBrowser = async (file: File, maxWidth: number = 1200, quality: number = 0.80): Promise<File> => {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  const mimeLower = (file.type || '').toLowerCase();
  const nameLower = (file.name || '').toLowerCase();

  // Skip vector, animated, or favicon icon formats where canvas conversion breaks them
  const skipTypes = ['image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/ico'];
  if (skipTypes.includes(mimeLower) || nameLower.endsWith('.ico') || nameLower.endsWith('.svg') || nameLower.endsWith('.gif')) {
    return file;
  }

  const isPng = mimeLower === 'image/png' || mimeLower === 'image/x-png' || nameLower.endsWith('.png');
  const isWebp = mimeLower === 'image/webp' || nameLower.endsWith('.webp');

  try {
    return await new Promise<File>((resolve) => {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Clear canvas so transparent pixels remain 100% transparent (RGBA 0,0,0,0)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const cleanName = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;

        if (isPng || isWebp) {
          // For transparent formats (PNG/WebP), export to PNG (or WebP) to preserve 100% alpha transparency
          const targetType = isWebp ? 'image/webp' : 'image/png';
          const targetExt = isWebp ? '.webp' : '.png';
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                return resolve(file);
              }
              return resolve(new File([blob], `${cleanName}${targetExt}`, { type: targetType, lastModified: Date.now() }));
            },
            targetType,
            quality
          );
          return;
        }

        // For JPEG or non-transparent formats:
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            return resolve(new File([blob], `${cleanName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  } catch (err) {
    console.error('Image compression error:', err);
    return file;
  }
};

export const compressImageToJPG = (file: File, maxWidth = 1200): Promise<File> => {
  return compressImageInBrowser(file, maxWidth);
};

export const uploadGlobal = async (file: File, setProgress?: (p: number) => void): Promise<string> => {
  const fileToUpload = (file.type && file.type.startsWith('image/')) ? await compressImageInBrowser(file) : file;
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken() || ''}`);
    xhr.setRequestHeader('x-artist-extension', getArtistExtensionFromUrl());
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && setProgress) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } catch (e) {
          reject(e);
        }
      } else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
};
