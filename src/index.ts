import Cron from 'node-cron';
import symmetryYoutubeThumb from './symmetryYoutubeThumbs';
import symmetryTwitterImages from './symmetryTwitterImages';
//  [seconds, minute, hour, day, month, dayOfWeek]
Cron.schedule('0 */10 * * * *', () => {
	// console.log('1時間おき実行');
	void symmetryYoutubeThumb();
});

void symmetryTwitterImages();
