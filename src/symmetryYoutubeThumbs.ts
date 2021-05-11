import checkYoutube from './modules/checkYoutube';
import EnvYaml from './modules/envReader';
import {putMovies} from './modules/DatabaseProcessor';

//    型の名前空間   実際のクラス
import FireStore, { Firestore } from '@google-cloud/firestore';

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
			});
		});
	}

};

void symmetryYoutubeThumb();
