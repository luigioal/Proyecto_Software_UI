const baseUrl = localStorage.getItem('baseUrl');
class S3Uploader {
    static async uploadFile(file) {
        console.log("Checking file: ", file);
        try {
            // 1. Get presigned URL from backend
            const presignResponse = await this._getPresignedUrl(file);
            
            // 2. Upload directly to S3
            await this._uploadToS3(file, presignResponse.uploadUrl);
            
            // 3. Return public URL
            return presignResponse.publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    static async _getPresignedUrl(file) {
        const response = await fetch(baseUrl + '/api/Seguridad/GeneratePresignedUrl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: file.name.trim(),
                contentType: file.type.trim()
            })
        });
        
        if (!response.ok) throw new Error('Failed to get upload URL');
        return await response.json();
    }

    static async _uploadToS3(file, uploadUrl) {
        console.log("Upload Url: ", uploadUrl);
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
        });
        
        if (!response.ok) throw new Error('S3 upload failed');
    }
}

window.S3Uploader = S3Uploader;