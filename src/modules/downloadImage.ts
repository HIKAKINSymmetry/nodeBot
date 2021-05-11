import request from 'request';
import fs from 'fs';

/**
 * 画像を保存して、成功すればファイルパスを渡す
 * @param {string} URL 画像のURL
 * @param {string} orderFileName **Optional** ファイルの名前(拡張子省略可能)
 * @return {Promise<string>} 画像を保存したパス
 */
const downloadImage = (URL: string, orderFileName?: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		request(
			{method: 'GET', url: URL, encoding: null},

			(error, response, body) => {
				if(!error && response.statusCode === 200){
					const fileExtention = URL.split('.').pop() as string;

					// 正規表現書くのめんどくさいので `/` で区切って一番最後の要素だけ取る
					const fileName = orderFileName ? `${orderFileName}.${fileExtention}` : URL.split('/').pop() as string;
					fs.writeFileSync(fileName, body, 'binary');

					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					resolve(`${process.env.PWD}/${fileName}`);
				}
				else {
					reject(error);
				}
			}

		);
	});

};

export default downloadImage;
