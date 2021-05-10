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
	const fs = require('fs');
  const yaml = require('js-yaml');
  const yamlText = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs : dotEnvYaml = yaml.load(yamlText);

	return envs.gcpProjectName;
}

/**
 * TwitterのAPIアクセスに必要なデータ一式を取得
 */
const TwitterAPI = () : twitterAPIKEY => {
	const fs = require('fs');
  const yaml = require('js-yaml');
  const yamlText = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs : dotEnvYaml = yaml.load(yamlText);

	return envs.twitterAPI;
}

/**
 * youtubeDataAPIのAPIキーを返す
 */
const youtubeDataAPI = () : youtubeDataAPIKEY => {
	const fs = require('fs');
  const yaml = require('js-yaml');
  const yamlText = fs.readFileSync('.envs/env.yaml', 'utf8');

	const envs : dotEnvYaml = yaml.load(yamlText);
	return envs.youtubeDataAPI; 
};

export default {
	GCPProjectID,
	TwitterAPI,
	youtubeDataAPI
};
