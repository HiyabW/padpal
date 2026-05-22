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

    if (!uploadUrl || !imageUrl) {
        throw new Error('Upload preparation returned an invalid response');
    }

    const uploadHost = new URL(uploadUrl).host;

    let uploadResponse;
    try {
        uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });
    } catch (error) {
        throw new Error(
            `Upload to ${uploadHost} was blocked (network or CORS). Check the S3 bucket region matches AWS_REGION.`
        );
    }

    if (!uploadResponse.ok) {
        throw new Error(`Upload to ${uploadHost} failed with status ${uploadResponse.status}`);
    }

    return imageUrl;
}
