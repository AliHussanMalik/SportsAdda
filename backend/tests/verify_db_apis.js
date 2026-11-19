const http = require('http');

function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ path, statusCode: res.statusCode, success: parsed.success !== false, data: parsed });
        } catch (e) {
          resolve({ path, statusCode: res.statusCode, success: false, raw: data });
        }
      });
    }).on('error', (err) => {
      resolve({ path, statusCode: 500, success: false, error: err.message });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing SportsAdda API & Database Connectivity...');
  const endpoints = [
    '/api/health',
    '/api/bookings/arenas',
    '/api/matches',
    '/api/matches/custom-grounds',
    '/api/auth/profiles',
    '/api/teams'
  ];

  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    if (res.success) {
      console.log(`✅ [${res.statusCode}] ${ep} - OK`);
    } else {
      console.warn(`⚠️ [${res.statusCode}] ${ep} - ${res.error || 'Check server status'}`);
    }
  }
}

runTests();
