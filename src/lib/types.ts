export type Document = {
	id: string;
	space_id: string;
	title: string;
	slug: string | null;
	status: 'draft' | 'scheduled' | 'published' | 'archived';
	visibility: 'private' | 'internal' | 'partner' | 'public';
	content_markdown: string | null;
	content_html: string | null;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	meta_title: string | null;
	meta_description: string | null;
};

export type DocumentDetails = {
	document_id: string;
	excerpt: string | null;
	language: string | null;
};

export type DocumentSeo = {
	document_id: string;
	meta_title: string | null;
	meta_description: string | null;
	keywords: string[] | null;
	allow_indexing: boolean | null;
};
