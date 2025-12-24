// Vercel Serverless Function for Killswitch Status
// Returns the killswitch status to prevent NOT_FOUND errors
// Accessible at: /api/security/killswitch-status (via rewrite) or /api/killswitch-status

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Default: killswitch is inactive
    // In production, you might want to check a database or external service
    const status = {
      active: false,
      message: 'Killswitch is inactive',
      timestamp: new Date().toISOString()
    };

    // Optional: Check for environment variable or external service
    // const killswitchActive = process.env.KILLSWITCH_ACTIVE === 'true';
    // if (killswitchActive) {
    //   status.active = true;
    //   status.message = 'Killswitch is active';
    // }

    return res.status(200).json(status);
  } catch (error) {
    console.error('Killswitch status error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      active: false
    });
  }
};

