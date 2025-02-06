const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();

// ... existing helper functions ...

// Create a function for each possible refresh interval
const refreshIntervals = [
    '0 0 * * *',     // Every day at midnight
    '0 0 */5 * *',   // Every 5 days at midnight
    '0 0 */15 * *',  // Every 15 days at midnight
    '0 0 1 * *'      // First day of every month at midnight
];

// Create a function for each interval
refreshIntervals.forEach(interval => {
    exports[`refreshListings_${interval.replace(/\s/g, '_')}`] = functions.pubsub
        .schedule(interval)
        .timeZone('America/New_York')
        .onRun(async (context) => {
            try {
                // Get the API key from Firebase config
                const apiKey = functions.config().marketcheck?.api_key;

                if (!apiKey) {
                    throw new Error('Marketcheck API key is not configured in Firebase config');
                }

                // Get all users who have selected this refresh interval
                const settingsSnapshot = await db.collection('userSettings')
                    .where('refreshInterval', '==', interval)
                    .get();

                console.log(`Found ${settingsSnapshot.size} users with refresh interval ${interval}`);

                // Process each user's VINs
                for (const settingsDoc of settingsSnapshot.docs) {
                    const userId = settingsDoc.id;

                    // Get user's VINs
                    const vinsSnapshot = await db.collection('vins')
                        .where('userId', '==', userId)
                        .get();

                    console.log(`Processing ${vinsSnapshot.size} VINs for user ${userId}`);

                    // Process each VIN
                    for (const vinDoc of vinsSnapshot.docs) {
                        const vinData = vinDoc.data();
                        const vinListingsRef = db.collection('listings').doc(vinData.vin);

                        try {
                            // Delete existing listings
                            await vinListingsRef.delete();
                            console.log(`Deleted existing listings for VIN ${vinData.vin}`);

                            // Fetch new listings
                            const historyData = await getVehicleHistory(vinData.vin, apiKey);
                            console.log(`Fetched ${historyData.length} history records for VIN ${vinData.vin}`);

                            // Process and save new listings
                            const listings = historyData
                                .filter(listing => listing && typeof listing === 'object')
                                .map(listing => cleanListingData(listing, vinData))
                                .filter(listing => listing.id && listing.date);

                            if (listings.length > 0) {
                                await vinListingsRef.set({
                                    listings,
                                    lastUpdated: new Date().toISOString()
                                });
                                console.log(`Updated listings for VIN ${vinData.vin}: ${listings.length} listings`);
                            } else {
                                console.log(`No listings found for VIN ${vinData.vin}`);
                            }
                        } catch (error) {
                            console.error(`Error processing VIN ${vinData.vin}:`, error);
                            continue;
                        }
                    }
                }

                console.log(`Completed refresh for interval ${interval}`);
                return null;
            } catch (error) {
                console.error(`Error in refresh for interval ${interval}:`, error);
                return null;
            }
        });
}); 