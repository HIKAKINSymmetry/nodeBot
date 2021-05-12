/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Jimp from 'jimp';
import path from 'path';

/**
 * 1枚目の画像の生成関数
 * @param {string} originalImagePath 元画像のファイルパス
 * @param {Number} symmetrylPoint シンメトリーをする軸のX座標
 * @param {string} outputFilePath 画像を出力するファイルパス
 * @returns {Promise<string>} 書き出したシンメトリー画像のファイルパス
 */
const make1stImage = async (originalImagePath: string, symmetryPoint: number, outputFilePath: string): Promise<string> => {

	// 既存画像の読み込みはJimp.read()
	// Promise の返却が先なので `await` で待ってから次に行く(でないと書き込みのタイミングがずれてえらいことになる)
	const originalImage = await Jimp.read(originalImagePath);
	// 新規画像の生成は `new Jimp(width, height, color)` で指定可能
	const SymmetricalImage1 = new Jimp( symmetryPoint * 2 + 20, originalImage.getHeight() + 20, '#FFFFFF');

	const croppedImage = originalImage.crop(0, 0, symmetryPoint, originalImage.getHeight());
	// `flip()` をするとレシーバに破戒的変更を及ぼすので、先に `blit()` で貼りつけ
	SymmetricalImage1.blit(croppedImage, 10, 10);

	const flippedImage = croppedImage.flip(true, false);
	SymmetricalImage1.blit(flippedImage, symmetryPoint + 10, 10).write(outputFilePath);
	console.log('Wrote 1st image.');

	// シェル上での実行場所によって書き出しのファイルパスが変化するので `process` から取得
	return path.resolve(`${process.env.PWD}/${outputFilePath}`);
};


/**
 * 2枚目の画像の生成関数
 * @param {string} originalImagePath 元画像のファイルパス
 * @param {Number} symmetrylPoint シンメトリーをする軸のX座標
 * @param {string} outputFilePath 画像を出力するファイルパス
 * @returns {Promise<string>} 書き出したシンメトリー画像のファイルパス
 */
const make2ndImage = async (originalImagePath: string, symmetryPoint: number, outputFilePath: string): Promise<string> => {

	const originalImage = await Jimp.read(originalImagePath);

	const SymmetricalImage2 = new Jimp((originalImage.getWidth() - symmetryPoint) * 2 + 20, originalImage.getHeight() + 20, '#FFFFFF');

	// 後半は切り抜く範囲なので計算が必要
	// 左にそのまま埋めるので一旦先に反転
	const flippedImage = originalImage.crop(symmetryPoint, 0, (originalImage.getWidth() - symmetryPoint), originalImage.getHeight()).flip(true, false);

	// 左側からなので `10, 10` の位置に貼りつけ
	SymmetricalImage2.blit(flippedImage, 10, 10);

	// `flip()` したものをもっかい `flip()` して元に戻す
	const croppedImage = flippedImage.flip(true, false);

	// 右側なので投稿する画像の `width` から 切り抜かれた画像の分を減算し、更に10px分白枠があるのでその分も減らした所に貼りつける
	SymmetricalImage2.blit(croppedImage, SymmetricalImage2.getWidth() - croppedImage.getWidth() - 10, 10).write(outputFilePath);
	console.log('Wrote 2nd image.');

	return path.resolve(`${process.env.PWD}/${outputFilePath}`);
};

export default {make1stImage, make2ndImage};
