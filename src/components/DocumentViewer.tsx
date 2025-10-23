import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Icon from './Icon.tsx';
import { documentsApi } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

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

const documentTypeOptions = [
	{ value: 'lease', label: 'Lease Agreement' },
	{ value: 'payment_receipt', label: 'Payment Receipt' },
	{ value: 'maintenance_report', label: 'Maintenance Report' },
	{ value: 'inspection', label: 'Inspection Report' },
	{ value: 'insurance', label: 'Insurance Policy' },
	{ value: 'payment_proof', label: 'Payment Proof' },
	{ value: 'other', label: 'Other' }
] as const;

const documentCategoryOptions = [
	{ value: 'tenant', label: 'Tenant' },
	{ value: 'financial', label: 'Financial' },
	{ value: 'legal', label: 'Legal' },
	{ value: 'maintenance', label: 'Maintenance' },
	{ value: 'compliance', label: 'Compliance' },
	{ value: 'other', label: 'Other' }
];

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

interface UploadFormState {
	name: string;
	description: string;
	type: string;
	category: string;
	file: File | null;
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

type PrimaryFilterType = 'lease' | 'payment_receipt' | 'maintenance_report' | 'other';

function DocumentViewer() {
	const { user } = useAuth();
	const { t } = useLanguage();
	const [documents, setDocuments] = useState<DocumentListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<'all' | PrimaryFilterType>('all');
	const [showUploadForm, setShowUploadForm] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [previewState, setPreviewState] = useState<{ detail: DocumentDetail; url: string | null } | null>(null);
	const [previewTargetId, setPreviewTargetId] = useState<string | null>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<UploadFormState>({ name: '', description: '', type: 'other', category: 'tenant', file: null });

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

	const filteredDocuments = useMemo(() => {
		if (filterType === 'all') {
			return documents;
		}
		return documents.filter((doc) => doc.type === filterType);
	}, [documents, filterType]);

	const fileToBase64 = (file: File) => {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result === 'string') {
					const payload = result.includes(',') ? result.split(',').pop() ?? '' : result;
					resolve(payload);
				} else {
					reject(new Error('Unable to read file'));
				}
			};
			reader.onerror = () => {
				reject(reader.error ?? new Error('Unable to read file'));
			};
			reader.readAsDataURL(file);
		});
	};

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

	const handleOpenUpload = () => {
		setFormData({ name: '', description: '', type: 'other', category: 'tenant', file: null });
		setShowUploadForm(true);
	};

	const handleSubmitUpload = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user?.id || !formData.file || !formData.name.trim()) {
			return;
		}
		setUploading(true);
		setError(null);
		try {
			const encoded = await fileToBase64(formData.file);
			const payload = {
				name: formData.name.trim(),
				description: formData.description.trim() || undefined,
				type: formData.type,
				category: formData.category,
				tenantId: user.id,
				uploadedBy: user.id,
				uploadedByName: user.fullName,
				fileName: formData.file.name,
				fileSize: formData.file.size,
				mimeType: formData.file.type || 'application/octet-stream',
				content: encoded,
				uploadDate: new Date().toISOString(),
				status: 'active'
			};
			const created = await documentsApi.upload(payload);
			const normalized = coerceDocument(created as Record<string, unknown>);
			setDocuments((prev) => sortByDate([normalized, ...prev.filter((item) => item.id !== normalized.id)]));
			setShowUploadForm(false);
			setFormData({ name: '', description: '', type: 'other', category: 'tenant', file: null });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to upload document');
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (doc: DocumentListItem) => {
		if (!doc.id) {
			return;
		}
		const confirmation = globalThis.confirm(`Delete "${doc.name}"?`);
		if (!confirmation) {
			return;
		}
		setDeletingId(doc.id);
		setError(null);
		try {
			await documentsApi.delete(doc.id);
			setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to delete document');
		} finally {
			setDeletingId(null);
		}
	};

	const handlePreview = async (doc: DocumentListItem) => {
		if (!doc.id) {
			return;
		}
		setPreviewTargetId(doc.id);
		setError(null);
		try {
			const response = await documentsApi.getById(doc.id);
			const detail = coerceDetail(response as Record<string, unknown>);
			let objectUrl: string | null = null;
			if (detail.content) {
				objectUrl = URL.createObjectURL(buildBlob(detail.content, detail.mimeType));
			}
			if (previewState?.url) {
				URL.revokeObjectURL(previewState.url);
			}
			setPreviewState({ detail, url: objectUrl });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to open document');
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
			} else {
				const response = await documentsApi.getById(doc.id);
				detail = coerceDetail(response as Record<string, unknown>);
			}
			if (!detail.content) {
				throw new Error('Document content not available');
			}
			const blob = buildBlob(detail.content, detail.mimeType);
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = detail.fileName || detail.name || 'document';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to download document');
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

	const uploadButtonLabel = t('documents.upload') || 'Upload Document';
	const documentsTitle = t('documents.title') || 'Documents';
	const allDocumentsLabel = t('documents.all') || 'All Documents';

	const filterButtons: Array<{ value: 'all' | PrimaryFilterType; label: string }> = [
		{ value: 'all', label: allDocumentsLabel },
		{ value: 'lease', label: getTypeLabel('lease') },
		{ value: 'payment_receipt', label: getTypeLabel('payment_receipt') },
		{ value: 'maintenance_report', label: getTypeLabel('maintenance_report') },
		{ value: 'other', label: getTypeLabel('other') }
	];

	const emptyStateText = filterType === 'all'
		? (t('documents.emptyAll') || 'Upload your first document to get started')
		: `No ${getTypeLabel(filterType).toLowerCase()}s found`;

	const totalCount = documents.length;
	const filteredCount = filteredDocuments.length;
	const totalLabel = totalCount === 0 ? 'No documents uploaded yet' : `${totalCount} ${totalCount === 1 ? 'document stored' : 'documents stored'}`;
	let showingLabel = 'No documents yet';
	if (totalCount > 0) {
		if (filterType === 'all') {
			const baseWord = totalCount === 1 ? 'document' : 'documents';
			showingLabel = `Showing ${filteredCount} of ${totalCount} ${baseWord}`;
		} else {
			const filterLabel = getTypeLabel(filterType);
			const filterWord = filteredCount === 1 ? filterLabel : `${filterLabel}s`;
			const baseWord = totalCount === 1 ? 'document' : 'documents';
			showingLabel = `Showing ${filteredCount} ${filterWord} (of ${totalCount} ${baseWord})`;
		}
	}

	return (
		<div className="document-viewer">
			<div className="section-card">
				<div className="section-card-header">
					<div>
						<div className="section-title">{documentsTitle}</div>
						<div className="section-subtitle">{totalLabel}</div>
					</div>
					<button type="button" className="btn btn-primary btn-sm" onClick={handleOpenUpload} disabled={uploading}>
						{uploadButtonLabel}
					</button>
				</div>
				<div className="section-card-body document-content">
					{error && <div className="alert alert-error">{error}</div>}
					<div className="document-toolbar">
						<div className="document-toolbar-summary">{showingLabel}</div>
						<div className="document-filters">
							{filterButtons.map((button) => (
								<button
									key={button.value}
									type="button"
									className={`filter-btn ${filterType === button.value ? 'active' : ''}`}
									onClick={() => setFilterType(button.value)}
								>
									{button.label}
								</button>
							))}
						</div>
					</div>

					{loading ? (
						<div className="loading-state">Loading documents...</div>
					) : filteredDocuments.length === 0 ? (
						<div className="empty-state-card">
							<Icon name="docs" alt="Documents" size={48} />
							<div className="empty-state-title">No documents found</div>
							<div className="empty-state-text">{emptyStateText}</div>
							{filterType === 'all' && (
								<button type="button" className="btn btn-primary" onClick={handleOpenUpload} disabled={uploading}>
									{uploadButtonLabel}
								</button>
							)}
						</div>
					) : (
						<div className="documents-list">
							{filteredDocuments.map((doc) => {
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
												<button
													type="button"
													className="btn btn-danger btn-xs"
													onClick={() => handleDelete(doc)}
													disabled={deletingId === doc.id}
												>
													Delete
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

			{showUploadForm && (
				<div className="modal-overlay" onClick={() => !uploading && setShowUploadForm(false)}>
					<div className="modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="modal-header">
							<div className="section-title">{uploadButtonLabel}</div>
							<button
								type="button"
								className="close-btn"
								onClick={() => setShowUploadForm(false)}
								disabled={uploading}
							>
								×
							</button>
						</div>
						<div className="modal-body">
							<form onSubmit={handleSubmitUpload} className="upload-form">
								<div className="form-group">
									<label className="form-label">Document Name</label>
									<input
										type="text"
										className="form-input"
										value={formData.name}
										onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
										placeholder="Enter document name"
										required
									/>
								</div>
								<div className="form-group">
									<label className="form-label">Description</label>
									<textarea
										className="form-input"
										value={formData.description}
										onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
										placeholder="Add a short note (optional)"
										rows={3}
									/>
								</div>
								<div className="form-group form-row">
									<div className="form-field">
										<label className="form-label">Type</label>
										<select
											className="form-select"
											value={formData.type}
											onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
										>
											{documentTypeOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
									<div className="form-field">
										<label className="form-label">Category</label>
										<select
											className="form-select"
											value={formData.category}
											onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
										>
											{documentCategoryOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className="form-group">
									<label className="form-label">Select File</label>
									<div className="file-input-wrapper">
										<input
											type="file"
											id="tenant-document-upload"
											className="file-input"
											onChange={(event) =>
												setFormData((prev) => ({
													...prev,
													file: event.target.files?.[0] ?? null
												}))
											}
											accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
											required
										/>
										<label htmlFor="tenant-document-upload" className="file-input-label">
											{formData.file ? formData.file.name : 'Choose a file'}
										</label>
									</div>
									{formData.file && (
										<div className="file-info">{formatFileSize(formData.file.size)}</div>
									)}
								</div>
								<div className="form-actions">
									<button
										type="button"
										className="btn btn-secondary"
										onClick={() => setShowUploadForm(false)}
										disabled={uploading}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn btn-primary"
										disabled={uploading || !formData.file || !formData.name.trim()}
									>
										{uploading ? 'Uploading...' : uploadButtonLabel}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{previewState && (
				<div className="modal-overlay" onClick={closePreview}>
					<div className="modal-content modal-large" onClick={(event) => event.stopPropagation()}>
						<div className="modal-header">
							<div className="section-title">{previewState.detail.name}</div>
							<button type="button" className="close-btn" onClick={closePreview}>
								×
							</button>
						</div>
						<div className="modal-body">
							<div className="document-preview">
								<div className="document-details-card">
									<div className="detail-row">
										<span className="detail-label">Type</span>
										<span className={`document-type-badge ${getTypeBadgeClass(previewState.detail.type)}`}>
											{getTypeLabel(previewState.detail.type)}
										</span>
									</div>
									<div className="detail-row">
										<span className="detail-label">Size</span>
										<span className="detail-value">{formatFileSize(previewState.detail.fileSize)}</span>
									</div>
									<div className="detail-row">
										<span className="detail-label">Uploaded</span>
										<span className="detail-value">{formatDate(previewState.detail.uploadDate)}</span>
									</div>
									{previewState.detail.uploadedByName && (
										<div className="detail-row">
											<span className="detail-label">Uploaded by</span>
											<span className="detail-value">{previewState.detail.uploadedByName}</span>
										</div>
									)}
									{previewState.detail.status && (
										<div className="detail-row">
											<span className="detail-label">Status</span>
											<span className={`status-badge ${getStatusClass(previewState.detail.status)}`}>
												{startCase(previewState.detail.status)}
											</span>
										</div>
									)}
								</div>
								<div className="document-preview-area">
									{previewState.url ? (
										previewState.detail.mimeType?.startsWith('image/') ? (
											<img src={previewState.url} alt={previewState.detail.name} className="document-preview-image" />
										) : previewState.detail.mimeType === 'application/pdf' ? (
											<iframe src={previewState.url} title={previewState.detail.name} className="document-preview-frame" />
										) : (
											<a href={previewState.url} target="_blank" rel="noreferrer" className="btn btn-link">
												Open document
											</a>
										)
									) : (
										<div className="empty-state-card">
											<Icon name="docs" alt="Document" size={48} />
											<div className="empty-state-title">Preview unavailable</div>
											<div className="empty-state-text">Download the document to view its contents</div>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="form-actions">
							<button type="button" className="btn btn-secondary" onClick={closePreview}>
								Close
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleDownload(previewState.detail)}
								disabled={downloadingId === previewState.detail.id}
							>
								Download
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default DocumentViewer;
