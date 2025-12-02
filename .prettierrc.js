module.exports = {
	bracketSpacing: false,
	tabWidth: 4,
	useTabs: true,
	trailingComma: "es5",
	semi: true,
	singleQuote: false,
	overrides: [
		{
			files: "*.tsx",
			options: {
				printWidth: 150,
			}
		},
		{
			files: "*.ts",
			options: {
				printWidth: 100,
			}
		}
	]
};
