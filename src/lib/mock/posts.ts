// Typer för bloggens databasstruktur
export type Post = {
	id: string;
	space_id: string;
	post_type: string;
	title: string;
	slug: string;
	cover_image: string;
	status: string;
	published_at: string;
	created_by: string;
	created_at: string;
	updated_at: string;
	name: string;
	external_id: string;
	source_type: string;
	content_text: string;
	scheduled_at: string | null;
	content_parsed_at: string | null;
};

export type PostDetails = {
	post_id: string;
	tags: string[];
	excerpt: string;
	language: string;
};

export type PostSeo = {
	post_id: string;
	meta_title: string;
	meta_description: string;
	keywords: string[];
	allow_indexing: boolean;
};

// Mockdata för blogginlägg
export const posts: Post[] = [
	{
		id: '1',
		space_id: 'space-1',
		post_type: 'blog',
		title: 'Välkommen till den anonyma bloggen',
		slug: 'valkommen-till-den-anonyma-bloggen',
		cover_image: 'https://picsum.photos/id/1015/600/400',
		status: 'published',
		published_at: '2025-04-18T10:00:00Z',
		created_by: 'user-1',
		created_at: '2025-04-17T09:00:00Z',
		updated_at: '2025-04-18T10:00:00Z',
		name: 'Välkommen',
		external_id: '',
		source_type: '',
		content_text:
			'Detta är första inlägget på vår anonyma och stilrena blogg. Här kommer du hitta tankar, tips och inspiration.',
		scheduled_at: null,
		content_parsed_at: null
	},
	{
		id: '2',
		space_id: 'space-1',
		post_type: 'blog',
		title: 'Minimalism i vardagen',
		slug: 'minimalism-i-vardagen',
		cover_image: 'https://picsum.photos/id/1025/600/400',
		status: 'published',
		published_at: '2025-04-19T08:00:00Z',
		created_by: 'user-1',
		created_at: '2025-04-18T12:00:00Z',
		updated_at: '2025-04-19T08:00:00Z',
		name: 'Minimalism',
		external_id: '',
		source_type: '',
		content_text:
			'Hur kan du förenkla ditt liv och skapa mer utrymme för det som är viktigt? Vi utforskar minimalismens kraft.',
		scheduled_at: null,
		content_parsed_at: null
	},
	{
		id: '3',
		space_id: 'space-1',
		post_type: 'blog',
		title: 'Att leva långsamt',
		slug: 'att-leva-langsamt',
		cover_image: 'https://picsum.photos/id/1035/600/400',
		status: 'published',
		published_at: '2025-04-20T07:00:00Z',
		created_by: 'user-1',
		created_at: '2025-04-19T18:00:00Z',
		updated_at: '2025-04-20T07:00:00Z',
		name: 'Slow Living',
		external_id: '',
		source_type: '',
		content_text:
			'Slow living handlar om att uppskatta ögonblicken. Här delar vi tankar kring varför det är värt att sakta ner.',
		scheduled_at: null,
		content_parsed_at: null
	},
	{
		id: '4',
		space_id: 'space-1',
		post_type: 'blog',
		title: 'Digital balans',
		slug: 'digital-balans',
		cover_image: 'https://picsum.photos/id/1045/600/400',
		status: 'published',
		published_at: '2025-04-21T08:30:00Z',
		created_by: 'user-1',
		created_at: '2025-04-20T13:00:00Z',
		updated_at: '2025-04-21T08:30:00Z',
		name: 'Digital Detox',
		external_id: '',
		source_type: '',
		content_text:
			'I en uppkopplad värld är det en konst att hitta balans. Så här skapar du utrymme för digital återhämtning.',
		scheduled_at: null,
		content_parsed_at: null
	},
	{
		id: '5',
		space_id: 'space-1',
		post_type: 'blog',
		title: 'När tystnaden talar',
		slug: 'nar-tystnaden-talar',
		cover_image: 'https://picsum.photos/id/1055/600/400',
		status: 'published',
		published_at: '2025-04-22T06:45:00Z',
		created_by: 'user-1',
		created_at: '2025-04-21T15:00:00Z',
		updated_at: '2025-04-22T06:45:00Z',
		name: 'Tystnad',
		external_id: '',
		source_type: '',
		content_text:
			'I tystnaden hittar vi svaren vi ofta söker i bullret. Ett inlägg om att våga lyssna – på riktigt.',
		scheduled_at: null,
		content_parsed_at: null
	}
];

export const postDetails: PostDetails[] = [
	{
		post_id: '1',
		tags: ['introduktion', 'blogg'],
		excerpt: 'Detta är första inlägget på bloggen. Läs mer om vad du kan förvänta dig!',
		language: 'sv'
	},
	{
		post_id: '2',
		tags: ['minimalism', 'livsstil', 'teknik'],
		excerpt: 'Utforska hur minimalism kan förändra din vardag och skapa mer lugn.',
		language: 'sv'
	},
	{
		post_id: '3',
		tags: ['slow living', 'filosofi'],
		excerpt: 'Ett hyllningsinlägg till det långsamma livet – och varför det behövs.',
		language: 'sv'
	},
	{
		post_id: '4',
		tags: ['digital detox', 'teknik', 'balans'],
		excerpt: 'Så återfår du kontrollen över din digitala vardag.',
		language: 'sv'
	},
	{
		post_id: '5',
		tags: ['tystnad', 'reflektion'],
		excerpt: 'Tystnad kan vara mer talande än tusen ord – vågar du lyssna?',
		language: 'sv'
	}
];

export const postSeo: PostSeo[] = [
	{
		post_id: '1',
		meta_title: 'Välkommen till bloggen',
		meta_description: 'En anonym och stilren blogg om livet, tankar och inspiration.',
		keywords: ['blogg', 'anonym', 'inspiration'],
		allow_indexing: true
	},
	{
		post_id: '2',
		meta_title: 'Minimalism i vardagen',
		meta_description: 'Tips och tankar om minimalism och enkelhet i livet.',
		keywords: ['minimalism', 'enkelhet', 'livsstil'],
		allow_indexing: true
	},
	{
		post_id: '3',
		meta_title: 'Slow Living – ett liv i långsamhet',
		meta_description: 'Utforska värdet av ett långsammare tempo i en hektisk värld.',
		keywords: ['slow living', 'filosofi', 'stressfritt'],
		allow_indexing: true
	},
	{
		post_id: '4',
		meta_title: 'Digital balans i en uppkopplad värld',
		meta_description: 'Skapa utrymme för återhämtning i den digitala vardagen.',
		keywords: ['digital detox', 'balans', 'teknik'],
		allow_indexing: true
	},
	{
		post_id: '5',
		meta_title: 'När tystnaden talar',
		meta_description: 'Reflektioner kring stillhetens kraft i en högljudd samtid.',
		keywords: ['tystnad', 'reflektion', 'medvetenhet'],
		allow_indexing: true
	}
];
