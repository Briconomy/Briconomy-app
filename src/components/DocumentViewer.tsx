import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from './Icon.tsx';
import { documentsApi } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

const typeLabels: Record<string, string> = {
	lease: 'Lease Agreement',
	payment_receipt: 'Payment Receipt',
	maintenance_report: 'Maintenance Report',
	inspection: 'Inspection Report',
	insurance: 'Insurance Policy',
	payment_proof: 'Payment Proof',
	contract: 'Contract',
	id: 'Identification',
	other: 'Other Document'
};

const iconMap: Record<string, string> = {
	lease: 'docs',
	payment_receipt: 'payment',
	maintenance_report: 'maintenance',
	inspection: 'maintenance',
	insurance: 'report',
	payment_proof: 'payment',
	contract: 'docLease',
	id: 'profile',
	other: 'docs'
};

const typeBadgeClassMap: Record<string, string> = {
	lease: 'type-lease',
	payment_receipt: 'type-payment',
	maintenance_report: 'type-maintenance',
	inspection: 'type-maintenance',
	insurance: 'type-lease',
	payment_proof: 'type-payment',
	contract: 'type-lease',
	id: 'type-other',
	other: 'type-other'
};

const statusClassMap: Record<string, string> = {
	active: 'status-paid',
	signed: 'status-paid',
	approved: 'status-paid',
	pending: 'status-pending',
	processing: 'status-pending',
	submitted: 'status-pending',
	rejected: 'status-overdue',
	expired: 'status-overdue'
};


interface DocumentListItem {
	id: string;
	name: string;
	description?: string;
	type?: string;
	category?: string;
	fileName?: string;
	fileSize?: number;
	mimeType?: string;
	uploadDate?: string;
	createdAt?: string;
	status?: string;
	uploadedByName?: string;
}

interface DocumentDetail extends DocumentListItem {
	content?: string;
}


const startCase = (value: string) =>
	value
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());

const formatFileSize = (size?: number) => {
	if (!size || Number.isNaN(size)) {
		return '—';
	}
	if (size < 1024) {
		return `${size} B`;
	}
	if (size < 1024 * 1024) {
		return `${(size / 1024).toFixed(1)} KB`;
	}
	if (size < 1024 * 1024 * 1024) {
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}
	return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (value?: string) => {
	if (!value) {
		return '—';
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}
	return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const estimateSizeFromBase64 = (encoded?: string) => {
	if (!encoded) {
		return undefined;
	}
	const sanitized = encoded.includes(',') ? encoded.split(',').pop() ?? '' : encoded;
	const length = sanitized.length;
	if (length === 0) {
		return undefined;
	}
	const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
	return Math.floor((length * 3) / 4) - padding;
};

const getTypeLabel = (type?: string) => {
	if (!type) {
		return 'General';
	}
	return typeLabels[type] ?? startCase(type);
};

const getIconName = (type?: string) => {
	if (!type) {
		return iconMap.other;
	}
	return iconMap[type] ?? iconMap.other;
};

const getTypeBadgeClass = (type?: string) => {
	if (!type) {
		return 'type-other';
	}
	return typeBadgeClassMap[type] ?? 'type-other';
};

const getStatusClass = (status?: string) => {
	if (!status) {
		return 'status-pending';
	}
	return statusClassMap[status] ?? 'status-pending';
};

// #COMPLETION_DRIVE: Assuming legacy document viewer styles remain available in the global stylesheet
// #SUGGEST_VERIFY: Validate the tenant documents page visually after reload on multiple breakpoints

function DocumentViewer() {
	const { user } = useAuth();
	const { t } = useLanguage();
	const { showToast } = useToast();
	const [documents, setDocuments] = useState<DocumentListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [previewState, setPreviewState] = useState<{ detail: DocumentDetail; url: string | null } | null>(null);
	const [previewTargetId, setPreviewTargetId] = useState<string | null>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	const sortByDate = useCallback((items: DocumentListItem[]) => {
		return items
			.slice()
			.sort((a, b) => {
				const aDate = new Date(a.uploadDate ?? a.createdAt ?? 0).getTime();
				const bDate = new Date(b.uploadDate ?? b.createdAt ?? 0).getTime();
				return bDate - aDate;
			});
	}, []);

	const coerceDocument = useCallback((input: Record<string, unknown>): DocumentListItem => {
		const idValue = input['id'];
		const fallbackId = input['_id'];
		let resolvedId = typeof idValue === 'string' && idValue ? idValue : '';
		if (!resolvedId) {
			if (typeof fallbackId === 'string' && fallbackId) {
				resolvedId = fallbackId;
			} else if (fallbackId && typeof (fallbackId as { toString?: () => string }).toString === 'function') {
				resolvedId = (fallbackId as { toString: () => string }).toString();
			}
		}

		const nameValue = input['name'];
		const fileNameValue = input['fileName'];
		const descriptionValue = input['description'];
		const typeValue = input['type'];
		const categoryValue = input['category'];
		const sizeValue = input['fileSize'];
		const mimeValue = input['mimeType'];
		const uploadDateValue = input['uploadDate'];
		const createdAtValue = input['createdAt'];
		const statusValue = input['status'];
		const uploadedByNameValue = input['uploadedByName'];

		let sizeNumber: number | undefined;
		if (typeof sizeValue === 'number' && Number.isFinite(sizeValue)) {
			sizeNumber = sizeValue;
		} else if (typeof sizeValue === 'string') {
			const parsed = Number(sizeValue);
			if (!Number.isNaN(parsed)) {
				sizeNumber = parsed;
			}
		}

		const uploadDate =
			typeof uploadDateValue === 'string'
				? uploadDateValue
				: typeof createdAtValue === 'string'
					? createdAtValue
					: undefined;

		const name =
			typeof nameValue === 'string' && nameValue
				? nameValue
				: typeof fileNameValue === 'string' && fileNameValue
					? fileNameValue
					: 'Document';

		const fallbackGeneratedId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

		return {
			id: resolvedId || fallbackGeneratedId,
			name,
			description: typeof descriptionValue === 'string' ? descriptionValue : undefined,
			type: typeof typeValue === 'string' ? typeValue : undefined,
			category: typeof categoryValue === 'string' ? categoryValue : undefined,
			fileName: typeof fileNameValue === 'string' ? fileNameValue : undefined,
			fileSize: sizeNumber,
			mimeType: typeof mimeValue === 'string' ? mimeValue : undefined,
			uploadDate,
			createdAt: typeof createdAtValue === 'string' ? createdAtValue : undefined,
			status: typeof statusValue === 'string' ? statusValue : undefined,
			uploadedByName: typeof uploadedByNameValue === 'string' ? uploadedByNameValue : undefined
		};
	}, []);

	const coerceDetail = useCallback((input: Record<string, unknown>): DocumentDetail => {
		const base = coerceDocument(input);
		const contentValue = input['content'];
		const detail: DocumentDetail = {
			...base,
			content: typeof contentValue === 'string' ? contentValue : undefined
		};
		if (!detail.fileSize && detail.content) {
			detail.fileSize = estimateSizeFromBase64(detail.content);
		}
		return detail;
	}, [coerceDocument]);

	const fetchDocuments = useCallback(async () => {
		if (!user?.id) {
			setDocuments([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const response = await documentsApi.getAll({ tenantId: user.id });
			const list = Array.isArray(response) ? (response as Array<Record<string, unknown>>) : [];
			const normalized = sortByDate(list.map((item) => coerceDocument(item)));
			setDocuments(normalized);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to fetch documents');
			setDocuments([]);
		} finally {
			setLoading(false);
		}
	}, [coerceDocument, sortByDate, user?.id]);

	useEffect(() => {
		fetchDocuments();
	}, [fetchDocuments]);

	useEffect(() => {
		return () => {
			if (previewState?.url) {
				URL.revokeObjectURL(previewState.url);
			}
		};
	}, [previewState]);

	const buildBlob = (base64: string, mimeType?: string) => {
		const sanitized = base64.includes(',') ? base64.split(',').pop() ?? '' : base64;
		const binary = atob(sanitized);
		const length = binary.length;
		const bytes = new Uint8Array(length);
		for (let index = 0; index < length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}
		return new Blob([bytes], { type: mimeType || 'application/octet-stream' });
	};

	const handlePreview = async (doc: DocumentListItem) => {
		if (!doc.id) {
			return;
		}
		setPreviewTargetId(doc.id);
		setError(null);
		try {
			const response = await documentsApi.getById(doc.id);
			console.log('[DocumentViewer] Preview response:', response);
			const detail = coerceDetail(response as Record<string, unknown>);
			console.log('[DocumentViewer] Coerced detail:', { ...detail, content: detail.content ? '(base64 content present)' : '(no content)' });
			let objectUrl: string | null = null;
			if (detail.content) {
				objectUrl = URL.createObjectURL(buildBlob(detail.content, detail.mimeType));
			} else {
				const msg = 'Preview content not available. The document may not have been uploaded correctly.';
				showToast(msg, 'info');
				console.log('[DocumentViewer] No content in detail:', detail);
			}
			if (previewState?.url) {
				URL.revokeObjectURL(previewState.url);
			}
			setPreviewState({ detail, url: objectUrl });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unable to open document';
			setError(errorMessage);
			showToast(errorMessage, 'error');
			console.error('[DocumentViewer] Preview error:', err);
		} finally {
			setPreviewTargetId(null);
		}
	};

	const handleDownload = async (doc: DocumentListItem | DocumentDetail) => {
		if (!doc.id) {
			return;
		}
		setDownloadingId(doc.id);
		setError(null);
		try {
			let detail: DocumentDetail | null = null;
			if ('content' in doc && doc.content) {
				detail = doc as DocumentDetail;
				console.log('[DocumentViewer] Download using existing detail with content');
			} else {
				console.log('[DocumentViewer] Download fetching document from API');
				const response = await documentsApi.getById(doc.id);
				console.log('[DocumentViewer] Download API response:', response);
				detail = coerceDetail(response as Record<string, unknown>);
			}
			if (!detail || !detail.content) {
				console.error('[DocumentViewer] Download failed - no content:', { detail: detail ? { ...detail, content: detail.content ? '(present)' : '(missing)' } : 'null' });
				throw new Error('Document content not available');
			}
			const blob = buildBlob(detail.content, detail.mimeType);
			if (!blob) {
				throw new Error('Failed to process document');
			}
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = detail.fileName || detail.name || 'document';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			showToast(`${detail.name} downloaded successfully`, 'success');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unable to download document';
			setError(errorMessage);
			showToast(errorMessage, 'error');
			console.error('[DocumentViewer] Download error:', err);
		} finally {
			setDownloadingId(null);
		}
	};

	const closePreview = () => {
		if (previewState?.url) {
			URL.revokeObjectURL(previewState.url);
		}
		setPreviewState(null);
	};

	const documentsTitle = t('documents.title') || 'Documents';
	const emptyStateText = t('documents.emptyAll') || 'No documents received yet';
	const totalCount = documents.length;
	const totalLabel = totalCount === 0 ? 'No documents received yet' : `${totalCount} ${totalCount === 1 ? 'document stored' : 'documents stored'}`;
	const baseWord = totalCount === 1 ? 'document' : 'documents';
	const showingLabel = totalCount === 0 ? 'No documents yet' : `Showing ${totalCount} ${baseWord}`;

	return (
		<div className="document-viewer">
			<div className="section-card">
				<div className="section-card-header">
					<div>
						<div className="section-title">{documentsTitle}</div>
						<div className="section-subtitle">{totalLabel}</div>
					</div>
				</div>
				<div className="section-card-body document-content">
					{error && <div className="alert alert-error">{error}</div>}
					<div className="document-toolbar">
						<div className="document-toolbar-summary">{showingLabel}</div>
					</div>

					{loading ? (
						<div className="loading-state">Loading documents...</div>
					) : documents.length === 0 ? (
						<div className="empty-state-card">
							<Icon name="docs" alt="Documents" size={48} />
							<div className="empty-state-title">No documents found</div>
							<div className="empty-state-text">{emptyStateText}</div>
						</div>
					) : (
						<div className="documents-list">
							{documents.map((doc) => {
								const hasTags = Boolean(doc.type) || Boolean(doc.status);
								const hasFooter = doc.fileSize !== undefined || Boolean(doc.uploadDate) || Boolean(doc.uploadedByName);
								return (
									<div key={doc.id} className="document-card">
										<div className="document-card-header">
											<div className="document-card-leading">
												<div className="document-card-icon">
													<Icon name={getIconName(doc.type)} alt={getTypeLabel(doc.type)} size={28} />
												</div>
												<div className="document-card-title">
													<div className="document-card-name">{doc.name}</div>
													{hasTags && (
														<div className="document-card-tags">
															{doc.type && (
																<span className={`document-type-badge ${getTypeBadgeClass(doc.type)}`}>{getTypeLabel(doc.type)}</span>
															)}
															{doc.status && (
																<span className={`status-badge ${getStatusClass(doc.status)}`}>{startCase(doc.status)}</span>
															)}
														</div>
													)}
												</div>
											</div>
											<div className="document-card-actions">
												<button
													type="button"
													className="btn btn-secondary btn-xs"
													onClick={() => handlePreview(doc)}
													disabled={previewTargetId === doc.id}
												>
													Preview
												</button>
												<button
													type="button"
													className="btn btn-secondary btn-xs"
													onClick={() => handleDownload(doc)}
													disabled={downloadingId === doc.id}
												>
													Download
												</button>
											</div>
										</div>
										{doc.description && <p className="document-card-description">{doc.description}</p>}
										{hasFooter && (
											<div className="document-card-footer">
												{doc.fileSize !== undefined && (
													<span className="document-card-footnote">{formatFileSize(doc.fileSize)}</span>
												)}
												{doc.uploadDate && (
													<span className="document-card-footnote">Uploaded {formatDate(doc.uploadDate)}</span>
												)}
												{doc.uploadedByName && (
													<span className="document-card-footnote">by {doc.uploadedByName}</span>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

		{previewState && (
			<div className="modal-overlay" onClick={closePreview}>
				<div
					className="modal-content"
					onClick={(event) => event.stopPropagation()}
					style={{
						maxWidth: '90vw',
						maxHeight: '90vh',
						height: '85vh',
						display: 'flex',
						flexDirection: 'column',
						padding: 0
					}}
				>
					<div className="modal-header" style={{ borderBottom: '1px solid var(--border-primary)', padding: '20px' }}>
						<div className="section-title" style={{ margin: 0 }}>{previewState.detail.name}</div>
						<button type="button" className="close-btn" onClick={closePreview} style={{ marginTop: 0 }}>
							×
						</button>
					</div>

					<div className="modal-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px' }}>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-primary)' }}>
							<div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Type</div>
								<span className={`document-type-badge ${getTypeBadgeClass(previewState.detail.type)}`}>
									{getTypeLabel(previewState.detail.type)}
								</span>
							</div>
							<div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Size</div>
								<div style={{ fontSize: '14px', fontWeight: '500' }}>{formatFileSize(previewState.detail.fileSize)}</div>
							</div>
							<div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Uploaded</div>
								<div style={{ fontSize: '14px', fontWeight: '500' }}>{formatDate(previewState.detail.uploadDate)}</div>
							</div>
							{previewState.detail.status && (
								<div>
									<div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Status</div>
									<span className={`status-badge ${getStatusClass(previewState.detail.status)}`}>
										{startCase(previewState.detail.status)}
									</span>
								</div>
							)}
						</div>

						<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: 'var(--background)', overflow: 'auto', minHeight: 0 }}>
							{previewState.url ? (
								previewState.detail.mimeType?.startsWith('image/') ? (
									<img src={previewState.url} alt={previewState.detail.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
								) : previewState.detail.mimeType === 'application/pdf' ? (
									<iframe src={previewState.url} title={previewState.detail.name} style={{ width: '100%', height: '100%', border: 'none' }} />
								) : (
									<div style={{ textAlign: 'center', padding: '40px' }}>
										<Icon name="docs" alt="Document" size={48} />
										<div style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600' }}>Document Ready</div>
										<a href={previewState.url} target="_blank" rel="noreferrer" className="btn btn-link" style={{ marginTop: '12px' }}>
											Open document in new window
										</a>
									</div>
								)
							) : (
								<div style={{ textAlign: 'center', padding: '40px' }}>
									<Icon name="docs" alt="Document" size={48} />
									<div style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Preview unavailable</div>
									<div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Download the document to view its contents</div>
								</div>
							)}
						</div>
					</div>

					<div className="form-actions" style={{ borderTop: '1px solid var(--border-primary)', padding: '16px 20px', gap: '12px', display: 'flex' }}>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={closePreview}
							style={{ flex: 1 }}
						>
							Close
						</button>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => handleDownload(previewState.detail)}
							disabled={downloadingId === previewState.detail.id}
							style={{ flex: 1 }}
						>
							{downloadingId === previewState.detail.id ? 'Downloading...' : 'Download'}
						</button>
					</div>
				</div>
			</div>
		)}

		</div>
	);
}

export default DocumentViewer;
