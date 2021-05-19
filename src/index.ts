import Cron from 'node-cron';
import symmetryYoutubeThumb from './symmetryYoutubeThumbs';
import symmetryTwitterImages from './symmetryTwitterImages';
//  [minute, hour, day, month, dayOfWeek]
Cron.schedule('0 * * * *', () => {
	// console.log('1時間おき実行');
	void symmetryYoutubeThumb();
});

void symmetryTwitterImages();
