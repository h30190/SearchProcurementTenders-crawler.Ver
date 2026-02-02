import { fetchAndFilterTenders } from './build/services/tender-service.js';

async function run() {
    try {
        const data = await fetchAndFilterTenders("室內裝修");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
