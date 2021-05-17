import dotEnv from './modules/envReader';
import downloadImage from './modules/downloadImage';
import twit, { Twitter } from 'twit';

/**
 * `tweet` にメディア(画像)が入っているかどうか確認する
 * @param {twit.Twitter.Status} tweet APIから返却されたツイートのオブジェクト
 * @returns {boolean} 入っていれば `true`
 */
const hasMediaIn = (tweet: twit.Twitter.Status): boolean => ('extended_entities' in tweet);

/**
 * 1ツイートに内包された画像を保存し、そのファイルパス群を返す
 * @param {twit.Twitter.MediaEntity} media
 * @returns {Promise<Array<string | Error>} ファイルパス群, もしくはエラーオブジェクト
 */
const saveImages = (entities: Twitter.Entities): Promise<Array<string>> => {
	return new Promise((resolve, reject) => {
		const saveImages = entities.media.map((meduim) => downloadImage(meduim.media_url_https));
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

	Stream.on('tweet', (Tweet: twit.Twitter.Status) => {
		if(hasMediaIn(Tweet)){
			console.log('メディアが存在しました');
			void saveImages(Tweet.entities)
				.then((savedImagePaths) => {
					console.log(savedImagePaths);
				})
				.catch(() => {
					console.log('画像の保存でエラーが発生しました');
				});
		}
	});
};

void symmetryTwitterImages();
