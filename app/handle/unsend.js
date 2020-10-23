module.exports = function({ api, __GLOBAL, User }) {
	function getText(...args) {
		const langText = __GLOBAL.language.unsend;
		const getKey = args[0];
		if (!langText.hasOwnProperty(getKey)) throw 'Ngu như bò.';
		let text = langText[getKey].replace(/\\n/gi, '\n');
		for (let i = 1; i < args.length; i++) text = text.replace(`%${i}`, args[i]);
		return text;
	}

	return async function({ event }) {
		if (__GLOBAL.resendBlocked.includes(parseInt(event.threadID))) return;
		if (!__GLOBAL.messages.some(item => item.msgID == event.messageID)) return;
		var getMsg = __GLOBAL.messages.find(item => item.msgID == event.messageID);
		let tag = await User.getName(event.senderID);
		if (event.senderID != api.getCurrentUserID())
			return api.sendMessage({
				body: tag + ((getMsg.msgBody == '') ? getText('unsentAttachment') : getText('unsent', getMsg.msgBody)),
				mentions: [{ tag, id: event.senderID }]
			}, event.threadID);
	}
}
