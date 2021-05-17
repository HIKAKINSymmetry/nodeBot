import Cron from 'node-cron';
import symmetryYoutubeThumb from './symmetryYoutubeThumbs';
import symmetryTwitterImages from './symmetryTwitterImages';
Cron.schedule('* */10 * * *', () => {
	// console.log('10分おき実行');
	void symmetryYoutubeThumb();
});

void symmetryTwitterImages();
