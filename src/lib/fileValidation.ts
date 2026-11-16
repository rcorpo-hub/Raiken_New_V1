/**
 * Client-Side Binary Magic Byte & File Inspection Utility
 * Protects forms from spoofed MIME types, oversized attachments, and malicious binaries.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

const ALLOWED_SIGNATURES: Record<string, number[]> = {
  // PDF: %PDF (25 50 44 46)
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  // JPEG: FF D8 FF
  'image/jpeg': [0xff, 0xd8, 0xff],
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  'image/png': [0x89, 0x50, 0x4e, 0x47],
};

export async function validateClientFile(file: File): Promise<FileValidationResult> {
  // 1. Size constraint
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum allowed upload size of 15 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty (0 bytes).`,
    };
  }

  // 2. Read first 8 bytes for binary magic number inspection
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (const [mime, signature] of Object.entries(ALLOWED_SIGNATURES)) {
      const matches = signature.every((byte, index) => bytes[index] === byte);
      if (matches) {
        return {
          valid: true,
          detectedMime: mime,
        };
      }
    }

    // Check for ZIP/DOCX/XLSX: PK (50 4B 03 04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return {
        valid: true,
        detectedMime: 'application/zip',
      };
    }

    return {
      valid: false,
      error: `File "${file.name}" header does not match approved statutory formats (PDF, JPEG, PNG, DOCX, ZIP).`,
    };
  } catch {
    return {
      valid: false,
      error: `Failed to inspect file binary header for "${file.name}".`,
    };
  }
}

