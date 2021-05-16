import checkYoutube from './modules/checkYoutube';
import EnvYaml from './modules/envReader';
import {putMovies, putMovie} from './modules/DatabaseProcessor';
import downloadImage from './modules/downloadImage';
import generateTweetsImage from './modules/makeSymmetryImages';

//    型の名前空間   実際のクラス
import FireStore, { Firestore } from '@google-cloud/firestore';
import {TwitterClient} from 'twitter-api-client';
// import sleep from 'sleep-promise';
import fs from 'fs';

/**
 * YoutubeのAPIを叩いてまだ処理されていない動画を検索する
 * @param {FireStore.Firestore} db DBのインスタンス
 * @returns {DB.MovieDetail[]} シンメトリー処理していない動画の情報
 */
const findHaventProcessedVideo = async (db: FireStore.Firestore) : Promise<DB.MovieDetail[]> => {
	const Playlists = await checkYoutube();

	// DBに `videoId` がなかったものたち
	const haventProcessedVideos: DB.MovieDetail[] = [];

	for(const playlist of Playlists){
		for(const video of playlist){
			const queryAccess = await db.collection('movies').where('videoId', '==', video.videoId).get();
			if(queryAccess.empty) haventProcessedVideos.push(video);
		}
	}

	return haventProcessedVideos;
};

/**
 * ファイルパスに指定した画像をTwitterのmediaサーバにアップロードする
 * @param {twit} twAPI `twit` のインスタンス
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

/**
 * 動画の情報からシンメトリー画像を生成し、Twitterにアップロードする
 * @param {DB.MovieDetail} video 1つの動画情報の集合オブジェクト
 */
const makeSymmetryTweet = async (video: DB.MovieDetail): Promise<boolean> => {
	if(typeof video.thumb !== 'undefined'){

		// ファイル名の拡張子は関数の内側で自動で識別して付けてくれるので一意の名前だけでOK
		const originalImage = await downloadImage(video.thumb, `${video.videoId}`);
		const Tweets = await generateTweetsImage(originalImage);

		return new Promise((resolve) => {
			if(Tweets.length < 1){
				// 画像から顔が検出されなかったetcで空Arrayのとき
				// ファイルを削除だけして終わり
				fs.unlink(originalImage, (error) => {
					if(error) console.log(error.message);
					console.log(`ファイルを削除しました: ${originalImage}`);
					// 顔が検出されないことは分かったのでDBにpushさせるため `true` を返す
					resolve(true);
				});
			}
			else {
				// 顔が検出されてツイートのメディア画像が出来てるとき
				// ツイート群をTwitterAPIへ投稿
				const uploadTweet = Tweets.map((tweet) => updateTwitterStatus(tweet));

				void Promise.all(uploadTweet).then((results) => {
					if(results.every(result => result === true)){
						console.log('投稿に成功しました');
						resolve(true);
					}
					else {
						console.log('投稿に失敗しました');
						resolve(false);
					}
				}).catch((reason) => {
					console.log(reason);
				});
			}

		});
	}
	else {
		return false;
	}
};

const symmetryYoutubeThumb = async () => {
	const database = new Firestore({
		projectId: EnvYaml.GCPProjectID(),
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		keyFilename: `${process.env.PWD}/.envs/serviceAccount.json`
	});
	// 1件のみ取得
	const CollectionSnapshot = await database.collection('movies').limit(1).get();

	if(CollectionSnapshot.empty){
		// データベースに何も入ってないので初期化的にデータを追加する
		console.log('データべース内部に何も入っていません 初期化作業を開始します');
		const fetchHikakinChannelsData = checkYoutube();

		void fetchHikakinChannelsData.then((PlaylistsData) => {
			void PlaylistsData.forEach((PlaylistItems) => {
				putMovies(PlaylistItems);
			});
		});

	}else{
		// データべースを検索してまわる
		console.log('データべースを検索中');
		void findHaventProcessedVideo(database).then((Videos) => {
			Videos.forEach((video) => {
				console.log(`videoId: ${video.videoId} を処理します`);
				const postTweet = makeSymmetryTweet(video);
				void postTweet.then((tweetResult) => {
					if(tweetResult){
						// 投稿に成功したとき or 顔が検出されなかったとき
						console.log(tweetResult);
						putMovie(video);
					}
				});
			});
		});
	}

};

void symmetryYoutubeThumb();
