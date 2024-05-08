import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  	{
		files: ["**/*.js"], 
		languageOptions: {
			sourceType: "script"
		}
	},
  	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions
			}
		}
	},
  	pluginJs.configs.recommended,
	{
		rules: {
			semi: ['error', 'always']
		},
	}
];