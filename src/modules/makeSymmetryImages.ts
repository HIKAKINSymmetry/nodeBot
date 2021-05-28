import vision from '@google-cloud/vision';
import EnvYaml from './envReader';
import SymmetryImage from './generateImages';
import path from 'path';
import fs from 'fs';

/**
 * 顔の四編の頂点情報から中心のX座標を算出する
 * @param {fdBoundingPoly.vertices} fdVertices 顔の検出した四編の頂点座標群
 * @returns {number} 中心のX座標の数値
 */
const detectFacesCenterCoordinate = (fdVertices: fdBoundingPoly.vertices): number	 => {
	const fdPositionsXCoordinates = fdVertices.map((fdVertice) => {
		return fdVertice.x;
	});

	// 配列の中の最大値と最小値を先に出しておく
	const maxCoordinate = Math.max(...fdPositionsXCoordinates);
	const minCoordinate = Math.min(...fdPositionsXCoordinates);

	// 小数点があるとエラーになりそうなので小数点以下を切り捨てる
	return Math.floor((maxCoordinate + minCoordinate) / 2);

};

/**
 * 画像をvisionAPIにかけ, 顔が検出されればシンメトリー画像を作って
 * 1ツイートごとに `Array` に内包して返す
 * @param {string} filePath シンメトリー画像を作る元の画像
 * @return {tweet.containMedia[]} 顔が見つかればツイートに使う画像
 * 																なければ空の配列
 */
const generateTweetsImage = async (filePath: string): Promise<tweet.containMedia[]> => {
	const visionAPI = new vision.ImageAnnotatorClient({
		projectId: EnvYaml.GCPProjectID(),
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		keyFilename: `${process.env.PWD}/.envs/serviceAccount.json`
	});

	// `faceDetection()` は顔の識別数上限が設定不可能なので
	// `annotateImage()` で代用
	const [faceDetectionResult] = await visionAPI.annotateImage({
		image: {
			source: {
				filename: filePath
			}
		},
		features: [
			{
				type: 'FACE_DETECTION',
				maxResults: 10
			}
		]
	});
	const faces = faceDetectionResult.faceAnnotations;

	const encodedOriginalImage: string = fs.readFileSync(filePath, {encoding: 'base64'});

	return new Promise((Resolve) => {

		// `undefined` と `null` は〇す
		if(typeof faces !== 'undefined' && faces !==  null){

			// 顔が検出されない場合があるので確認を通す
			if(faces.length > 0){
				// ファイルの名前(拡張子なし)を取る(生成する画像のファイル名の決定に使う)
				const originalImageBaseFilename = path.basename(filePath, path.extname(filePath));

				const tweetContainMediaPromises = faces.map((face, currentNumber): Promise<tweet.containMedia> => {
					return new Promise((resolve) => {
						const tweetMediaList: tweet.containMedia = [];
						// 顔の中心座標の算出
						const FaceCenterCoordinate = detectFacesCenterCoordinate(
							face.fdBoundingPoly?.vertices as fdBoundingPoly.vertices
						);

						// 2枚の画像の生成を平行して実行、全部終わったら画像を `base64` エンコードしたデータが帰ってくる
						void Promise.all([
							SymmetryImage.make1stImage(filePath, FaceCenterCoordinate),
							SymmetryImage.make2ndImage(filePath, FaceCenterCoordinate),
						])
							.then((generateImages) => {
								// ツイートの元画像を追加してからシンメトリー画像を突っ込む
								tweetMediaList.push(encodedOriginalImage);
								generateImages.forEach((generateImageEncodedData) => tweetMediaList.push(generateImageEncodedData));
								resolve(tweetMediaList);
							});

					});
				});

				void Promise.all(tweetContainMediaPromises).then((tweetMedia) => {
					Resolve(tweetMedia);
				});
			}
			else{
				// 見つからなければ特に何もしない
				console.log('画像から顔が検出されませんでした');
				Resolve([]);

			}
		}
		else {
			console.log('VisionAPIから不正な値が返却されました');
			Resolve([]);
		}

	});
};

export default generateTweetsImage;
