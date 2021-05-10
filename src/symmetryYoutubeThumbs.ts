import checkYoutube from './checkYoutube';
import EnvYaml from './modules/envReader';
import {putMovies} from './modules/DatabaseProcessor';

//    型の名前空間   実際のクラス
import FireStore, { Firestore } from '@google-cloud/firestore';

const symmetryYoutubeThumb = async () => {

	const fireStoreCredentials: FireStore.Settings = {
		projectId: EnvYaml.GCPProjectID(),
		keyFilename: `${process.env.PWD}/.envs/serviceAccount.json`
	};

	const database = new Firestore(fireStoreCredentials);
	const CollectionSnapshot = await database.collection('movies').get();

	if(CollectionSnapshot.empty){
		// データベースに何も入ってないので初期化的にデータを追加する
		console.log('データべース内部に何も入っていません 初期化作業を開始します');
		const fetchHikakinChannelsData = checkYoutube();

		fetchHikakinChannelsData.then((PlaylistsData) => {
			PlaylistsData.forEach((PlaylistItems) => {
				putMovies(PlaylistItems);
			});
		});

	}else{
		// データべースを検索してまわる
		console.log('データべースを検索中');
	}

};

symmetryYoutubeThumb();
