import FireStore, { Firestore } from '@google-cloud/firestore';

const collectionName = process.env.NODE_ENV === 'develop' ? 'nightly_movies' : 'movies';

/**
 * 1プレイリスト内の動画の情報をFirebaseに送信する
 * @param {Array<DB.MovieDetail>} moviesInfo 動画の情報のあつまり(`thumb` や `title` など)
 */
const putMovies = (movies: Array<DB.MovieDetail>): void => {

	const database = new Firestore();

	movies.forEach((movieInfo) => {
		console.log(`データベースに記述中 : ${movieInfo.videoId}/${movieInfo.title} `);
		void database.collection(collectionName).doc().set(movieInfo);
	});
};

/**
 * 1つの動画オブジェクトをFirestoreにpushする
 * @param movies 単一の動画
 */
const putMovie = (movie: DB.MovieDetail): void => {

	const fireStoreCredentials: FireStore.Settings = {};
	const database = new Firestore(fireStoreCredentials);

	console.log(`データベースに記述中 : ${movie.videoId}/${movie.title} `);
	void database.collection(collectionName).doc().set(movie);

};

export {putMovies, putMovie};
