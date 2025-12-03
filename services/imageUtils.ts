export const processImage = (
  base64Image: string,
  rotation: number,
  brightness: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Convert brightness from 0-200 range (100 is default) to percent string for filter
      // Note: ctx.filter is supported in modern browsers.
      // Fallback or manual pixel manipulation could be used if strict legacy support needed, 
      // but filter is standard now.
      
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.sin(radians);
      const cos = Math.cos(radians);

      // Calculate new canvas dimensions to fit rotated image
      const width = img.width;
      const height = img.height;
      
      const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
      const newHeight = Math.abs(width * sin) + Math.abs(height * cos);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Apply filters before drawing
      ctx.filter = `brightness(${brightness}%)`;

      // Translate to center and rotate
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      
      // Draw image centered
      ctx.drawImage(img, -width / 2, -height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
};