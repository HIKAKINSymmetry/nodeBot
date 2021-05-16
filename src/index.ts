import Cron from 'node-cron';
import symmetryYoutubeThumb from './symmetryYoutubeThumbs';

Cron.schedule('* */10 * * *', () => {
	// console.log('10分おき実行');
	void symmetryYoutubeThumb();
});
