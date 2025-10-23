import React, { useState, useRef } from 'react';

interface PaymentProofUploaderProps {
  onFileSelected: (fileName: string, fileData: string, mimeType: string) => void;
  isLoading?: boolean;
}

function PaymentProofUploader({ onFileSelected, isLoading }: PaymentProofUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, PNG, and JPEG files are allowed');
      setUploadedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      setUploadedFile(null);
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      onFileSelected(file.name, base64String, file.type);
      setUploadedFile({ name: file.name, type: file.type });
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setUploadedFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
        Upload Payment Proof
      </h3>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '32px 24px',
          border: '2px dashed var(--border-primary)',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--background)',
          transition: 'all 0.2s ease'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.background = 'var(--primary-light, rgba(52, 152, 219, 0.05))';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.background = 'var(--background)';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.background = 'var(--background)';
          const file = e.dataTransfer.files[0];
          if (file) {
            const event = {
              target: { files: [file] }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(event);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
          📎
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
          Click to upload or drag and drop
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          PDF, PNG, or JPEG (Max 5MB)
        </div>
      </div>

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'var(--success-light, rgba(46, 204, 113, 0.1))',
          border: '1px solid var(--success-color, #2ecc71)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>✅</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {uploadedFile.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {uploadedFile.type === 'application/pdf' ? 'PDF' : 'Image'} - Ready to upload
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'var(--error-light, rgba(231, 76, 60, 0.1))',
          border: '1px solid var(--error-color, #e74c3c)',
          borderRadius: '8px',
          color: 'var(--error-color, #e74c3c)',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default PaymentProofUploader;