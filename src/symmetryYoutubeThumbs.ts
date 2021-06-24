import checkYoutube from './modules/checkYoutube';
import {putMovies, putMovie} from './modules/DatabaseProcessor';
import downloadImage from './modules/downloadImage';
import generateTweetsImage from './modules/makeSymmetryImages';
import updateTwitterStatus from './modules/tweetUploader';

//    型の名前空間   実際のクラス
import FireStore, { Firestore } from '@google-cloud/firestore';
import moment from 'moment';
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
						// 元画像を削除
						fs.unlink(originalImage, (error) => {
							if(error) console.log(error.message);
							console.log(`ファイルを削除しました: ${originalImage}`);
							// 顔が検出されないことは分かったのでDBにpushさせるため `true` を返す
							resolve(true);
						});
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

/**
 * Youtubeからデータを取得してシンメトリー画像を投稿する
 * 要はYoutube周りのエントリーポイント
 */
const symmetryYoutubeThumb = async (): Promise<void> => {
	const database = new Firestore();
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
		const nowTime = moment().format('YYYY/MM/DD HH:mm:ss');
		console.log(nowTime, 'データべースを検索中');
		void findHaventProcessedVideo(database).then((Videos) => {
			Videos.forEach((video) => {
				console.log(`videoId: ${video.videoId} を処理します`);
				const postTweet = makeSymmetryTweet(video);
				void postTweet.then((tweetResult) => {
					if(tweetResult){
						// 投稿に成功したとき or 顔が検出されなかったとき
						putMovie(video);
					}
				});
			});
		});
	}

};

export default symmetryYoutubeThumb;
