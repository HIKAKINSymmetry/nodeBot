import fs from 'fs';
import yaml from 'js-yaml';

type twitterAPIKEY ={
	consumer: {
		key: string,
		secret: string
	},

	access: {
		token: string,
		secret: string
	}
};

type youtubeDataAPIKEY = {
	apikey: string
};

/**
 * `.envs/env.yaml` の構造
 */
type dotEnvYaml = {
	gcpProjectName: string,
	twitterAPI: twitterAPIKEY,
	youtubeDataAPI: youtubeDataAPIKEY
}

/**
 * GCPのプロジェクトIDを `.envs/env.yaml` から取得
 */
const GCPProjectID = () : string => {
	const yamlText = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs = yaml.load(yamlText) as dotEnvYaml;

	return envs.gcpProjectName;
};

/**
 * TwitterのAPIアクセスに必要なデータ一式を取得
 */
const TwitterAPI = () : twitterAPIKEY => {
	const yamlText = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs = yaml.load(yamlText) as dotEnvYaml;

	return envs.twitterAPI;
};

/**
 * youtubeDataAPIのAPIキーを返す
 */
const youtubeDataAPI = () : youtubeDataAPIKEY => {
	const yamlText: string = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs = yaml.load(yamlText) as dotEnvYaml;
	return envs.youtubeDataAPI;
};

export default {
	GCPProjectID,
	TwitterAPI,
	youtubeDataAPI
};
