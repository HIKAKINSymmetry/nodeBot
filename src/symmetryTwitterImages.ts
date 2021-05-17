import dotEnv from './modules/envReader';
import downloadImage from './modules/downloadImage';
import generateTweetsImage from './modules/makeSymmetryImages';
import updateTwitterStatus from './modules/tweetUploader';
import twit from 'twit';
import fs from 'fs';

// `@types/twit` が古くて `extended_entities` が入ってないので自前で入れる
type ExtendedStatus = twit.Twitter.Status & {
	extended_entities?: {
		media: twit.Twitter.MediaEntity[]
	}
}


const makeSymmetryTweet = async (imagePath: string) => {
	const Tweets = await generateTweetsImage(imagePath);

	if(Tweets.length < 1){
		// 画像から顔が検出されなかったetcで空Arrayのとき
		// ファイルを削除だけして終わり
		fs.unlink(imagePath, (error) => {
			if(error) console.log(error.message);
			console.log(`ファイルを削除しました: ${imagePath}`);
		});
	}
	else {
		// 顔が検出されてツイートのメディア画像が出来てるとき
		// ツイート群をTwitterAPIへ投稿
		const uploadTweet = Tweets.map((tweet) => updateTwitterStatus(tweet));

		void Promise.all(uploadTweet).then((results) => {
			if(results.every(result => result === true)){
				console.log('投稿に成功しました');
				// 元画像を削除
				fs.unlink(imagePath, (error) => {
					if(error) console.log(error.message);
					console.log(`ファイルを削除しました: ${imagePath}`);
				});
			}
			else {
				console.log('投稿に失敗しました');
			}
		}).catch((reason) => {
			console.log(reason);
		});
	}
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

/**
 * Twitterまわりのエントリーポイント
 */
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

	const Stream = twitterAPI.stream('statuses/filter', {follow: [userIDs.hikakin]});

	Stream.on('tweet', (Tweet: ExtendedStatus) => {
		// メディアが入ってるなら `extended_entities` は `undefined` にはなってない
		if(typeof Tweet.extended_entities !== 'undefined'){
			console.log('メディアが存在しました');
			void saveImages(Tweet.extended_entities?.media)
				.then((savedImagePaths) => {
					savedImagePaths.forEach((imagePath) => void makeSymmetryTweet(imagePath));
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

export default symmetryTwitterImages;
