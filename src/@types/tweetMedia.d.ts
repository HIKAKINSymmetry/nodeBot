declare namespace tweet{
	/**
	 * 1ツイート内に収める画像群(画像は`base64`エンコードした画像のstring)
	 */
	export type containMedia = string[];

	/**
	 * Twitterのメディアサーバにアップロードした時のレスポンス
	 * https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
	 */
	export type mediumUploadResponse = {
		media_id: number,
		media_id_string: string,
		media_key: string,
		size: number,
		expires_after_secs: number,
		image: {
			image_type: string,
			w: number,
			h: number
		}
	}
}
