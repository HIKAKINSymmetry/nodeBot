
declare module DB{
	/**
	 * 必要な情報だけ切り抜かれた動画単体の情報
	 */
 type MovieDetail = {
	videoId: string,
	title: string,
	thumb: string | undefined, // 一応 `undefined` も入れてるけどほぼ意味ない
	publishedAt: string
	}
}
