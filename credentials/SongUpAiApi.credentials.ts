import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SongUpAiApi implements ICredentialType {
	name = 'songUpAiApi';

	displayName = 'SongUp AI API';

	icon: Icon = { light: 'file:../icons/songupai.svg', dark: 'file:../icons/songupai.dark.svg' };

	documentationUrl = 'https://github.com/ismailgalaxys25-del/n8n-nodes-songupai?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Make a key in SongUp AI under Settings → API keys (https://www.songupai.com/settings?tab=developers). It starts with sup_.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.songupai.com/api/v1',
			url: '/me',
		},
	};
}
