import {
	NodeConnectionTypes,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

const showForCreate = { resource: ['song'], operation: ['create'] };

export class SongUpAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SongUp AI',
		name: 'songUpAi',
		icon: { light: 'file:../../icons/songupai.svg', dark: 'file:../../icons/songupai.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Make AI songs with vocals in 24 languages from an idea or your own lyrics',
		defaults: {
			name: 'SongUp AI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'songUpAiApi', required: true }],
		requestDefaults: {
			baseURL: 'https://www.songupai.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Song', value: 'song' }],
				default: 'song',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['song'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a song',
						description:
							'Start an AI song with vocals. It is ready in about 1-3 minutes: use Get or the SongUp AI Trigger to get the MP3.',
						routing: { request: { method: 'POST', url: '/songs' } },
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a song',
						description: 'Get a song by ID, with its status and the MP3 link once it is finished',
						routing: { request: { method: 'GET', url: '=/songs/{{encodeURIComponent($parameter.songId)}}' } },
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many songs',
						description: 'List the songs in your account, newest first',
						routing: {
							request: { method: 'GET', url: '/songs' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'songs' } }] },
						},
					},
				],
				default: 'create',
			},
			{
				displayName: 'Song Idea',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 3 },
				required: true,
				default: '',
				placeholder: 'A happy birthday song for my sister Sara, upbeat pop',
				description:
					'What the song is about: who it is for, names, the occasion, the mood or style. Up to 1,000 characters.',
				displayOptions: { show: showForCreate },
				routing: { send: { type: 'body', property: 'prompt' } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: showForCreate },
				options: [
					{
						displayName: 'Language Name or ID',
						name: 'language',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getLanguages' },
						default: '',
						description:
							'Leave empty to sing in the language of the song idea. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
						routing: { send: { type: 'body', property: 'language' } },
					},
					{
						displayName: 'Lyrics',
						name: 'lyrics',
						type: 'string',
						typeOptions: { rows: 6 },
						default: '',
						description:
							'Your own words, up to 3,000 characters. Needs SongUp AI Pro once the first free songs are used. Leave empty and SongUp AI writes the words.',
						routing: { send: { type: 'body', property: 'lyrics' } },
					},
					{
						displayName: 'Music Type',
						name: 'music_type',
						type: 'options',
						options: [
							{ name: 'Brand Intro', value: 'Brand Intro' },
							{ name: 'Cinematic Score', value: 'Cinematic Score' },
							{ name: 'Full Vocal Song', value: 'Full Vocal Song' },
							{ name: 'Instrumental Beat', value: 'Instrumental Beat' },
							{ name: 'Lo-Fi Beats', value: 'Lo-Fi Beats' },
							{ name: 'Nursery Rhymes', value: 'Nursery Rhymes' },
							{ name: 'Only Vocals', value: 'Only Vocals' },
							{ name: 'Short Jingle', value: 'Short Jingle' },
						],
						default: 'Full Vocal Song',
						routing: { send: { type: 'body', property: 'music_type' } },
					},
					{
						displayName: 'Style',
						name: 'style',
						type: 'string',
						default: '',
						description: 'A genre or style, for example Pop, Rock, Lo-fi or Bollywood',
						routing: { send: { type: 'body', property: 'style' } },
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'title' } },
					},
				],
			},
			{
				displayName: 'Song ID',
				name: 'songId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID returned by Create',
				displayOptions: { show: { resource: ['song'], operation: ['get'] } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Any', value: 'any' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Pending', value: 'pending' },
				],
				default: 'any',
				displayOptions: { show: { resource: ['song'], operation: ['getAll'] } },
				routing: { send: { type: 'query', property: 'status' } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['song'], operation: ['getAll'] } },
				routing: { send: { type: 'query', property: 'limit' } },
			},
		],
	};

	methods = {
		loadOptions: {
			async getLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'songUpAiApi', {
					method: 'GET',
					url: 'https://www.songupai.com/api/v1/languages',
					json: true,
				})) as { languages: Array<{ name: string; native: string }> };
				return response.languages.map((l) => ({
					name: l.native === l.name ? l.name : `${l.name} (${l.native})`,
					value: l.name,
				}));
			},
		},
	};
}
