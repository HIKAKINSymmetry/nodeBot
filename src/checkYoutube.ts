import request from 'request';
import envYaml from './modules/envReader';

/**
 * 必要な情報だけ切り抜かれた動画単体の情報
 */
type pickedMovieDetail = {
	videoId: string,
	title: string,
	thumb: string | undefined, // 一応 `undefined` も入れてるけどほぼ意味ない
	publishedAt: string
}


/**
 * YoutubeDataAPI からプレイリストの内容を取得する  
 * https://developers.google.com/youtube/v3/docs/playlistItems/list
 * @param {string} playlistId プレイリストのID
 * @return {Promise<YTDataAPI.PlailistItem[] | string>} エラーの場合はエラーのメッセージを返す
 */
 const fetchPlaylistItem = (playlistId: string) : Promise<YTDataAPI.PlaylistItem[]| string>=> {
	const Endpoint = 'https://www.googleapis.com/youtube/v3/playlistItems';

	const requestParams = {
		method: 'GET',
		url: Endpoint,
		json: true,
		qs: {
			key: envYaml.youtubeDataAPI().apikey,
			part: 'snippet',
			maxResults: 3,
			playlistId: playlistId
		}
	};

	return new Promise((resolve, reject) => {
		request(requestParams,
			(Error: Error, response: request.Response, body: YTDataAPI.Playlist) => {
			if(!Error && response.statusCode === 200){
				resolve(body.items);
			}
			else{
				reject(Error.message);
			}
		});
	});
};

/**
 * 動画のオブジェクト群の必要なデータだけ切り抜いて渡す
 * @param {Array<YTDataAPI.playlistItem>} movies APIから引っ張ってきたプレイリストのデータ 
 * @returns {Array<pickedMovieDetail>} 必要なデータだけ切り抜いたオブジェクト群 
 */
 const pickMoviesDetail = (movies: YTDataAPI.PlaylistItem[]): Array<pickedMovieDetail> => {

	return movies.map((movie: YTDataAPI.PlaylistItem) => {
		// `maxres` のキーが無い旧時代の動画があることがあるので
		// なかった場合は `standard` のキーのサムネイルを登録
		const thumbnailURL = 'maxres' in movie.snippet.thumbnails ?
			movie.snippet.thumbnails.maxres?.url : movie.snippet.thumbnails.standard.url;

		return {
			videoId: movie.snippet.resourceId.videoId,
			title: movie.snippet.title,
			thumb: thumbnailURL,
			publishedAt: movie.snippet.publishedAt
		};
	});
};

const checkYoutube = () : Promise<pickedMovieDetail[]> => {

	const playlistIds =  [
		'UUlLV6D8S4CrVJL64-aQvwTw', // Uploads from HIKAKIN
		'UUZf__ehlCEBPop-_sldpBUQ', // Uploads from HikakinTV
		'UUX1xppLvuj03ubLio8jslyA', // Uploads from HikakinBlog
		'UUQMoeRP9SDaFipXDBIp3pFA'  // Uploads from HikakinGames
	];

	const fetchingPlaylists = playlistIds.map((playlistId: string) => {
		return fetchPlaylistItem(playlistId);
	});

	return new Promise((resolve, _reject) => {

		Promise.all(fetchingPlaylists).then((fetchedPlaylists) => {
			// 4つのチャンネルの情報を回す
			fetchedPlaylists.forEach((playlist: YTDataAPI.PlaylistItem[] | string): void => {
				if(typeof playlist !== 'string'){
					resolve(pickMoviesDetail(playlist));
				}
			});
		});
	
	});
	
};

export default checkYoutube;
