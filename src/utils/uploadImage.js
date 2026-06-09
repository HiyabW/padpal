import { apiFetch } from './apiFetch';

const ALLOWED_CONTENT_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export async function uploadProfileImage(file) {
    if (!file) {
        throw new Error('No file selected');
    }

    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
        throw new Error('Please upload a JPEG, PNG, or WebP image');
    }

    const presignResponse = await apiFetch('/images/presignUpload', {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
    });

    if (!presignResponse.ok) {
        const errorBody = await presignResponse.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || 'Failed to prepare image upload');
    }

    const { uploadUrl, imageUrl } = await presignResponse.json();

    const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to storage');
    }

    return imageUrl;
}
