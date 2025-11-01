import cron from 'node-cron';
import { syncData } from './dataSyncService.js';

// Run initial sync when backend starts
console.log('Starting initial data sync...');
syncData()
  .then(() => console.log('Initial data sync completed successfully'))
  .catch(error => console.error('Initial data sync failed:', error));

// Schedule data sync every 7 days (at midnight)
cron.schedule('0 0 */7 * *', async () => {
  console.log('Starting scheduled data sync...');
  try {
    await syncData();
    console.log('Scheduled data sync completed successfully');
  } catch (error) {
    console.error('Scheduled data sync failed:', error);
  }
});

// Export the initialized cron job
export default cron;