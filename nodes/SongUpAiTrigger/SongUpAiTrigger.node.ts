import {
	NodeConnectionTypes,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';

type Song = { id: string; created_at: string; completed_at: string | null };

export class SongUpAiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SongUp AI Trigger',
		name: 'songUpAiTrigger',
		icon: { light: 'file:../../icons/songupai.svg', dark: 'file:../../icons/songupai.dark.svg' },
		group: ['trigger'],
		version: 1,
		description:
			'Starts the workflow when a song in your SongUp AI account is finished, including songs made with the SongUp AI node',
		subtitle: 'Song Finished',
		defaults: {
			name: 'SongUp AI Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'songUpAiApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Song Finished',
						value: 'songFinished',
						description: 'A song is finished and has an MP3',
					},
				],
				default: 'songFinished',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const state = this.getWorkflowStaticData('node') as { lastFinishedAt?: number };
		const isManual = this.getMode() === 'manual';
		const qs: Record<string, string | number> = { status: 'completed', limit: isManual ? 1 : 50 };
		if (!isManual && state.lastFinishedAt) qs.since = state.lastFinishedAt;

		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'songUpAiApi', {
			method: 'GET',
			url: 'https://www.songupai.com/api/v1/songs',
			qs,
			json: true,
		})) as { songs: Song[] };

		const finishedAt = (song: Song) => Date.parse(song.completed_at ?? song.created_at);
		const songs = response.songs;

		if (!isManual) {
			// First poll: remember where we are and emit nothing, so old songs do not fire.
			const first = state.lastFinishedAt === undefined;
			if (songs.length) state.lastFinishedAt = Math.max(...songs.map(finishedAt));
			else if (first) state.lastFinishedAt = Date.now();
			if (first) return null;
		}

		if (!songs.length) return null;
		// The API lists newest first: emit oldest first.
		return [this.helpers.returnJsonArray([...songs].reverse())];
	}
}
