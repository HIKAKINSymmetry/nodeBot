declare module YTDataAPI {
	type contentDetails = {
		videoId: string,
		startAt: string,
		endAt: string,
		note: string,
		videoPublishedAt: any
	};
	
	/**
	 * サムネイル画像
	 */
	export type thumbnail = {
		url: string,
		width: number,
		height: number
	};
	
	/**
	 * 動画単体の情報の中身
	 */
	export type snippet = {
		publishedAt: any,
		channelId: string,
		title: string, // 動画タイトル
		description: string, // 動画説明文
		thumbnails: {
			default:  thumbnail, // 120 x 90
			medium:   thumbnail, // 320 x 180
			high:     thumbnail, // 480 x 360
			standard: thumbnail, // 640 x 480
			maxres?:  thumbnail  // 1280 x 720
		},
		channelTitle: string, // チャンネルの名前
		playlistId: string, // プレイリストのID
		position: number,
		resourceId: {
			kind: string,
			videoId: string // 動画のID
		}
	};
	
	/**
	 * 動画の単体情報のあつまり？詳しいのは `snippet` にある
	 */
	export type PlaylistItem = {
		kind: 'youtube#playlistItem',
		etag: any, // つかわない
		id: string,
		snippet: snippet
		contentDetails: contentDetails
	};
	
	/**
	 * API から帰ってくるJSONの実体
	 * https://developers.google.com/youtube/v3/docs/playlistItems/list
	 */
	export type Playlist = {
		kind: 'youtube#playlistItemListResponse',
		etag: any, // つかわない
		nextPageToken: string,
		prevPageToken: string,
		
		pageInfo: any, // 使わない
		items: PlaylistItem[]
	};
	
}
