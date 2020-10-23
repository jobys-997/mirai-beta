require("dotenv").config();
const path = require("path");
module.exports = {
	development: false,
	email: process.env.EMAIL,
	password: process.env.PASSWORD,
	prefix: process.env.PREFIX,
	language: process.env.LANGUAGE,
	botName: process.env.BOT_NAME,
	googleSearch: process.env.GOOGLE_SEARCH,
	wolfarm: process.env.WOLFARM,
	tenor: process.env.TENOR,
	openweather: process.env.OPENWEATHER,
	saucenao: process.env.SAUCENAO,
	waketime: process.env.WAKETIME,
	sleeptime: process.env.SLEEPTIME,
	otpkey: process.env.OTPKEY,
	autorestart: process.env.REFRESHING,
	admins: (process.env.ADMINS || '').split('_').map(e => parseInt(e)),
	nsfwGodMode: false,
	database: {
		postgres: {
			database: 'postgres',
			username: 'postgres',
			password: 'root',
			host: 'localhost',
		},
		sqlite: {
			storage: path.resolve(__dirname, "./data.sqlite"),
		},
	},
	appStateFile: path.resolve(__dirname, '../appstate.json')
}