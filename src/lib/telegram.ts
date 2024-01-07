const TELEGRAM_TOKEN_YOGA_COM_KAKA_USERS_BOT =
  '6677300209:AAENEs-PSREirWq8rDao9CJxNA_gAEhok64';

const telegramIds = [
  664124193, //João
  933361773, // kaká
  6022236228, // anna
];

export default async function sendMessageToYogaComKakaTelegramGroup(
  message: string
) {
  for (const telegramID of telegramIds) {
    const url =
      'https://api.telegram.org/bot' +
      TELEGRAM_TOKEN_YOGA_COM_KAKA_USERS_BOT +
      '/sendMessage?chat_id=' +
      telegramID +
      '&text=' +
      message +
      '&parse_mode=HTML';

    if (process.env.NODE_ENV === 'production') {
      console.log(message);
      await fetch(encodeURI(url));
    } else {
      console.log(message);
      // send message to telegram using the fetch API
      // await fetch(encodeURI(url));
    }
  }
}
