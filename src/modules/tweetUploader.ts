import EnvYaml from './envReader';
import {TwitterClient} from 'twitter-api-client';

/**
 * 画像をTwitterのmediaサーバにアップロードする
 * @param {TwitterClient} twAPI `twitterClient` のインスタンス
 * @param encodedImage base64エンコードした画像
 * @returns {Promise<string | Error>} 成功していればメディアのID(string)
 */
const uploadImage = (twAPI: TwitterClient, encodedImage: string): Promise<string | Error>  => {
	return new Promise((resolve) => {
		const uploadImage = twAPI.media.mediaUpload({
			media_data: encodedImage,
			media_category: 'tweet_image'
		});
		void uploadImage
			.then((response) => {
				console.log('media Upload Success', response.media_id_string);
				resolve(response.media_id_string);
			})
			.catch((reason) => {
				console.log(reason);
			});
	});
};

/**
 * Twitterに画像付きツイートをアップロードする
 * @param {tweet.containMedia} tweetImages 1ツイート分の画像
 * @returns {Promise<true>} 全プロセスで成功すれば `true` そうでなければrejectされてる
 */
const updateTwitterStatus = async (tweetImages: tweet.containMedia): Promise<true> => {
	const config = EnvYaml.TwitterAPI();
	const twitterAPI = new TwitterClient({
		apiKey: config.consumer.key,
		apiSecret: config.consumer.secret,
		accessToken: config.access.token,
		accessTokenSecret: config.access.secret
	});

	const postImageToTwitter = tweetImages.map((containImage) => uploadImage(twitterAPI, containImage));
	return new Promise((resolve, reject) => {

		void Promise.all(postImageToTwitter)
			.then((postedMediaIds) => {

				const filteredMediaIds = postedMediaIds.filter((currentItem): currentItem is string => typeof currentItem === 'string');

				// Error が混ざってて捨てられたものがある場合要素数に変化があるのでそれを見る
				if(filteredMediaIds.length !== postedMediaIds.length){
					// エラーが混ざってたことになるので棄却
					console.log('画像のアップロード中にエラーが発生しました');
					reject();
				}
				else {
					// 問題なくメディアがアップロードできているので Statuses/update をする
					void twitterAPI.tweets.statusesUpdate({
						status: '',
						media_ids: filteredMediaIds.join(',')
					}).then((statusUpdateResponse) => {
						if(statusUpdateResponse.id_str){
							resolve(true);
						}
						else{
							reject();
						}
					});
				}

			}).catch((error) => {
				console.log('画像のアップロードが棄却されました');
				console.log(error);
			});

	});
};

export default updateTwitterStatus;
