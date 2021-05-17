import dotEnv from './modules/envReader';
import downloadImage from './modules/downloadImage';
import twit from 'twit';

// `@types/twit` が古くて `extended_entities` が入ってないので自前で入れる
type ExtendedStatus = twit.Twitter.Status & {
	extended_entities?: {
		media: twit.Twitter.MediaEntity[]
	}
}

/**
 * 画像をTwitterのmediaサーバにアップロードする
 * @param {twit} twAPI twitのインスタンス
 * @param {string} Image アップロードする画像(`base64`エンコードしたものを前提とする)
 * @return {Promise<string | Error>} 正常終了すれば`media_id_string`
 */
const uploadImage = (twAPI: twit, Image: string): Promise<string | Error>  => {
	return new Promise((resolve, reject) => {
		void twAPI.post('media/upload', {media_data: Image}, (error, result) => {
			if(error){
				reject(error);
			}
			else{
				const replacedResult = result as tweet.mediumUploadResponse;
				resolve(replacedResult.media_id_string);
			}
		});
	});
};

/**
 * 1ツイートに内包された画像を保存し、そのファイルパス群を返す
 * @param {twit.Twitter.MediaEntity} media
 * @returns {Promise<Array<string | Error>} ファイルパス群, もしくはエラーオブジェクト
 */
const saveImages = (media: twit.Twitter.MediaEntity[]): Promise<Array<string>> => {
	return new Promise((resolve, reject) => {
		console.log(media.length);
		const saveImages = media.map((meduim) => downloadImage(meduim.media_url_https));
		void Promise.all(saveImages)
			.then((savedImagePaths) => {
				resolve(savedImagePaths);
			})
			.catch((reason: Error) => {
				reject(reason);
			});
	});
};

const symmetryTwitterImages = (): void => {
	const dotEnvsConfig  = dotEnv.TwitterAPI();
	const twitterAPI = new twit({
		consumer_key: dotEnvsConfig.consumer.key,
		consumer_secret: dotEnvsConfig.consumer.secret,
		access_token: dotEnvsConfig.access.token,
		access_token_secret: dotEnvsConfig.access.secret
	});

	// デバッグ目的で `huequica` のIDを使えるように突っ込んでおく
	const userIDs = {
		hikakin: '130447415',
		huequica: '1013602985698459648'
	};

	const Stream = twitterAPI.stream('statuses/filter', {follow: [userIDs.huequica]});

	Stream.on('tweet', (Tweet: ExtendedStatus) => {
		// メディアが入ってるなら `extended_entities` は `undefined` にはなってない
		if(typeof Tweet.extended_entities !== 'undefined'){
			console.log('メディアが存在しました');
			void saveImages(Tweet.extended_entities?.media)
				.then((savedImagePaths) => {
					console.log(savedImagePaths);
				})
				.catch(() => {
					console.log('画像の保存でエラーが発生しました');
				});
		}
		else {
			console.log('メディアはありませんでした');
		}
	});
};

void symmetryTwitterImages();
