import envYaml from './envReader';
import FireStore, { Firestore } from '@google-cloud/firestore';


/**
 * 1プレイリスト内の動画の情報をFirebaseに送信する
 * @param {Array<DB.MovieDetail>} moviesInfo 動画の情報のあつまり(`thumb` や `title` など)
 */
 const putMovies = (movies: Array<DB.MovieDetail>) => {

	const fireStoreCredentials: FireStore.Settings = {
		projectId: envYaml.GCPProjectID(),
		keyFilename: `${process.env.PWD}/.envs/serviceAccount.json`
	};
	const database = new Firestore(fireStoreCredentials);

	movies.forEach((movieInfo) => {
		console.log(`データベースに記述中 : ${movieInfo.videoId}/${movieInfo.title} `)
		database.collection('movies').doc().set(movieInfo);
	});
};

export {putMovies};
