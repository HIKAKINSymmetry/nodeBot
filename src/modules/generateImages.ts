/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * 1枚目の画像の生成関数
 * @param {string} originalImagePath 元画像のファイルパス
 * @param {Number} symmetrylPoint シンメトリーをする軸のX座標
 * @param {string} outputFilePath 画像を出力するファイルパス
 * @returns {Promise<string>} 書きだした画像のbase64エンコードしたString
 */
const make1stImage = async (originalImagePath: string, symmetryPoint: number, outputFilePath: string): Promise<string> => {
	const {Image} = require('image-js');
	// 既存画像の読み込みはImage.load()
	// Promise の返却が先なので `await` で待ってから次に行く(でないと書き込みのタイミングがずれてえらいことになる)
	const originalImage = await Image.load(originalImagePath);

	const originalImageDetails = {
		width: originalImage.width,
		height: originalImage.height
	};
	// 新規画像の生成は `new Jimp(width, height, {options})` で指定可能
	// 初期の画像の背景色が指定できなさそうなので `invert()` で黒を白に反転させる
	let SymmetricalImage1 = new Image(symmetryPoint * 2 + 20, 20 + originalImageDetails.height).invert();

	// width(height) は切り取る範囲
	const croppedImage = originalImage.crop({
		x: 0,
		y: 0,
		width: symmetryPoint,
		height: originalImageDetails.height
	});

	// 先に貼りつけ
	SymmetricalImage1 = SymmetricalImage1.insert(croppedImage, {x: 10, y: 10});

	// 切り抜かれた画像をX方向に反転
	const flippedImage = croppedImage.flipX();

	// もう一度貼りつけ
	SymmetricalImage1 = SymmetricalImage1.insert(flippedImage, {x: symmetryPoint + 10, y: 10});
	void SymmetricalImage1.save(outputFilePath);
	return await SymmetricalImage1.toBase64('image/jpeg');
};


/**
 * 2枚目の画像の生成関数
 * @param {string} originalImagePath 元画像のファイルパス
 * @param {Number} symmetrylPoint シンメトリーをする軸のX座標
 * @param {string} outputFilePath 画像を出力するファイルパス
 * @returns {Promise<string>} 書きだした画像のbase64エンコードしたString
 */
const make2ndImage = async (originalImagePath: string, symmetryPoint: number, outputFilePath: string): Promise<string> => {
	const {Image} = require('image-js');
	const originalImage = await Image.load(originalImagePath);
	const originalImageDetails = {
		width: originalImage.width,
		height: originalImage.height
	};

	let SymmetricalImage2 = new Image((originalImageDetails.width - symmetryPoint) * 2 + 20, originalImageDetails.height + 20).invert();
	const flippedImage = originalImage.crop({
		x: symmetryPoint,
		y: 0,
		width: originalImageDetails.width - symmetryPoint,
		height: originalImageDetails.height
	}).flipX();

	SymmetricalImage2 = SymmetricalImage2.insert(flippedImage, {x: 10, y: 10});

	const croppedImage = flippedImage.flipX();

	SymmetricalImage2 = SymmetricalImage2.insert(croppedImage, {x: SymmetricalImage2.width - croppedImage.width - 10, y: 10});
	void SymmetricalImage2.save(outputFilePath);
	return await SymmetricalImage2.toBase64('image/jpeg');
};

export default {make1stImage, make2ndImage};
