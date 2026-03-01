module.exports = {
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    verifyToken: process.env.META_VERIFY_TOKEN,
    igBusinessId: process.env.META_IG_BUSINESS_ID,
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN,
  },
  mvp: {
    scannerUrl: `${process.env.PLANT_SCANNER_URL || 'https://thenurserygreen.com/plant-scanner.html'}?src=ig_mvp_scan_dm`,
    scanKeywords: ['scan', 'help', 'plant', 'sos'],
    autoReplyLimitPerUserPerDay: 3,
  },
};

