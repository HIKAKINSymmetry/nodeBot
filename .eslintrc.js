module.exports = {
	env: {
		node: true
	},

  root: true, // .eslintrc.jsがプロジェクトのルートに配置させているか（指定がないと上位階層へ設定ファイルを探索される）
  parser: '@typescript-eslint/parser', // ESLintにTypeScriptを理解させる
  parserOptions: {
    project: './tsconfig.json' // tsconfig.jsonの場所を指定
  },
  plugins: [
    '@typescript-eslint' // ESLintのTypeScriptプラグインのルールを適用できる様にする（/eslint-pluginは省略可）
  ],
  extends: [
    'eslint:recommended', // ESLintのJavaScriptルールセットを適用
    'plugin:@typescript-eslint/eslint-recommended', // eslint:recommendedに含まれるルールを型チェックでカバーできるものは無効化
    'plugin:@typescript-eslint/recommended', // 型チェックが不要なルールを適用
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // 型チェックが必要なルールを適用
  ],
	rules: {
		semi: 'error',
		'no-var': 'error',
		eqeqeq: 'error',
		'comma-spacing': 'error',
		indent: ['error', 'tab'],
		'block-spacing': 'error',
		'space-infix-ops': 'error',
		'arrow-spacing': 'error',
		'no-mixed-spaces-and-tabs': 'error'
	}
}
