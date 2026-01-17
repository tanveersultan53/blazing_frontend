/**
 * Image Resizer Utility
 * Resizes images before upload while maintaining aspect ratio
 */

export type ImageType = 'logo' | 'other';

interface ResizeOptions {
  /** Target width in pixels */
  targetWidth: number;
  /** Output image format */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Quality for JPEG/WebP (0-1) */
  quality?: number;
}

// Default widths for different image types
const IMAGE_WIDTHS: Record<ImageType, number> = {
  logo: 265,
  other: 94,
};

/**
 * Resizes an image file to the specified width while maintaining aspect ratio
 * @param file - The image file to resize
 * @param imageType - The type of image ('logo' or 'other') to determine target width
 * @param options - Optional override options
 * @returns Promise<File> - The resized image as a File object
 */
export async function resizeImage(
  file: File,
  imageType: ImageType = 'other',
  options?: Partial<ResizeOptions>
): Promise<File> {
  const targetWidth = options?.targetWidth ?? IMAGE_WIDTHS[imageType];
  const outputFormat = options?.outputFormat ?? 'image/jpeg';
  const quality = options?.quality ?? 0.9;

  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate the new dimensions maintaining aspect ratio
      const aspectRatio = img.height / img.width;
      const newWidth = Math.min(targetWidth, img.width); // Don't upscale
      const newHeight = Math.round(newWidth * aspectRatio);

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw the resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          // Create a new File from the blob
          const resizedFile = new File([blob], file.name, {
            type: outputFormat,
            lastModified: Date.now(),
          });

          // Clean up
          URL.revokeObjectURL(img.src);

          resolve(resizedFile);
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resizes an image from a FileList (typically from an input element)
 * @param fileList - The FileList from an input element
 * @param imageType - The type of image ('logo' or 'other') to determine target width
 * @param options - Optional override options
 * @returns Promise<File | null> - The resized image or null if no file
 */
export async function resizeImageFromFileList(
  fileList: FileList | null,
  imageType: ImageType = 'other',
  options?: Partial<ResizeOptions>
): Promise<File | null> {
  if (!fileList || fileList.length === 0) {
    return null;
  }

  const file = fileList[0];

  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  return resizeImage(file, imageType, options);
}

/**
 * Helper to resize multiple images
 * @param files - Array of objects containing file and image type
 * @returns Promise<Map<string, File>> - Map of field names to resized files
 */
export async function resizeMultipleImages(
  files: Array<{ file: File; imageType: ImageType; fieldName: string }>
): Promise<Map<string, File>> {
  const results = new Map<string, File>();

  await Promise.all(
    files.map(async ({ file, imageType, fieldName }) => {
      const resizedFile = await resizeImage(file, imageType);
      results.set(fieldName, resizedFile);
    })
  );

  return results;
}

/**
 * Get the target width for a specific image type
 * @param imageType - The type of image
 * @returns The target width in pixels
 */
export function getTargetWidth(imageType: ImageType): number {
  return IMAGE_WIDTHS[imageType];
}
