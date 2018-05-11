const util = require('util')
const bootstrap = require('../index');

let config = {
  authRequired: false,  // set to true for real testing
  mockToken: true,
};

let testJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvYm8iOiJwbHVnaW5fc2x1ZyIsImF1ZCI6WyJmdW5jdGlvbl9pZCIsImFwaS5kcm9uZWRlcGxveS5jb20iXSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9yZ2FuaXphdGlvbl9pZCI6Im9yZ19pZCIsImV4cCI6MTYyNTA0NDA2OSwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.OIrad7oVWaZmQ5YgZ2bmq961w9-3vaf_6vQabsI6E_1QGwxBdzo6tuesQo0kZe3QxyOUskoGggAFWW337zNAebcYZMxka6MwgElDIu7tdQ-5S6991vRN37KsReVlelqY78GMG_ohVb1iaXee0jplFNy_1S_Y3fx0ZvVdtVE99zdXukCfw4-tRQmtJq3LDi2PsifixeAoBatzgsoEefHYpdCEek-RD9CRWmeNDGz9Dd5May0_oruCFrxk9yagwdw6_TdhjY6Ti6aYZQGVF4l3xrZl8uvmxZZDZYCFB3aSeee8vlYHeecrLZTPv7HFRKhI2x-CIrxNbBs3L8EoBc2xp9e4MKEWiv-UyXtLzdw1OgGpwH3SdqBmj4-COYT5uFgV6bWVz-zYTHLcGGn1-BAOPjBMCfeCfKXjcEzjoCgIsULhV3NdAOdPu_GSCppyRd_O3whGTHvLihgxd8LoeZ5FdQlBvjbQMQ-6yiw92juE8LJSFOnQ9995lOeTfyN2Hzv0ovw4QMnTnWgXCb3YTmmmbTkpidSfGCXtgsiemwAecTD9tF8VMU-lEIH-5v0mOZWz-6a2LKl8hkSdjm2i8l3Dz1oeoZrW_sQkFatLeSGUZb2l0VeVvpN66oTfZB8_n78APEjeqfOrEsaxrBtigaDXbGq8OvW2-poPJb2Z4Q-tsDE";
  //"eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXS1MifQ.eyJhdWQiOlsiZnVuY3Rpb25faWQiLCJhcGkuZHJvbmVkZXBsb3kuY29tIl0sImV4cCI6MTYyNTA0NDA2OSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9ibyI6InBsdWdpbl9zbHVnIiwib3JnYW5pemF0aW9uX2lkIjoib3JnX2lkIiwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.ut8P1LC2N6Xke0qrIkaaMdNKfAuFixQMBMF4s7D3drWuBQr4Wa4ybqVy3a9vy4WW9SZa0CZqRVa5yh1O__RzmhoyYUTTP0bWppONZt2OREKl2Ght2eEi_QYxYHj23jPBqJSbkpVW1lCSzO0BeUvQ54fmywVKdu5WITCk8ivp16DuVfRm65_JlrU7K7VryCuRFor1z21WnRj7NBML052prZfJ_-P4U3eV5ZFcl7qJi-rknStnu-7sc3Rierdy10uuBCEsbRt1fVZ0vVhADmX8s52Q8e1vHikQTvgC7u2AQFAnH6ewJj0GbQbvHOfpyZeCq9Ti1XoOztOt3lVgJWi-xbw_0gHpeb_6Mocav-OJyvVXAcuprArbzvXrbmRi9PQ4U4AuvDsVIVY-pS3SadxZK0TbLbMui9hpC-yE2En0tLXPS07jndzWZRh9ObsZsLV5HSLuXsCXtODoGhPPMDoyGca7EaGCZ1BQ7duI_eIgjaXMErPBYbE0tjhjddnXJ1YuCXsJuFYNBbtgsNFLKZNutH83LCteQpwHCJ5lH4BkLW1o-iGSekQ_PTuSbPDG2Th-S-_LSJT22f8UrMMdtvmPSAJhu7bbx0kF2BwyeWA6UPPr_d620UCn4yQHNPLzjePb5nFfh1mnYN8VB4tMSTAjYBwidDCWGOIC9rW96ZF22hQ";
//testJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXS1MifQ.eyJhdWQiOlsiZnVuY3Rpb25faWQiLCJhcGkuZHJvbmVkZXBsb3kuY29tIl0sImV4cCI6MTYyNTA0NDA2OSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9ibyI6InBsdWdpbl9zbHVnIiwib3JnYW5pemF0aW9uX2lkIjoib3JnX2lkIiwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIiwiZGF0YXN0b3JlIiwiZnVuY3Rpb25zIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.yGTpFIwzr6HnpvG0begf2n0OJa2jgBFaz8eXvxtHR-ucjCrJYXcGB_AXYQ1F0P_1-Rm7cmomdBDImnm77Leqj7W7P6Yvy8MWpO3ykEwQKl4krv1abkeJaVtB1gpCikRlpFW50027GsIQySXN3SQBePHAbXr1wurocn78_5K37-SJQzpISyBu4RZnsswKsDRcYrCb95rAgP_5X2EEx6wLHgSbLucrcLF3Vg9IMNpjesry8QOmCTbpB251ZfWXz4_k0tR5qVlDofoXMR_qw7ytIl1hHWPCxORtvOF71vdfLMqEeQxBBpEvcvshVv0c93KB52hqGuzV17Q-jEwHzs0ebe1Gr5xBaJFCNU8KVTqXd15UJu0pjJMizDSh-Oz7LuyxsfATTTIBdudSWHEM5Ivmx2J3UAvWdWPDq93laoiC_Hyegk_cgSc5-v4LErJ8xScUUuuTXReThpO9r7s3XKLeohi7s8h-u9iNUI5F8hcQX6G66BY9wDQ33BThv1mrDUU503Zm6yQABXDjBnDsv5Z-JY9P7u1FQVrueSNyae4xSLSi5LTUFf6-mXoW-MkIuJEL30973ZXVH2bnMiWetY7oIO9rRbl9xqHLXgFMbMaWgZekrmbwE-UCnhp5qCdQolM0bN5ZubXIMNahgXcr6edEVX6kV6IEu-xx-j2T_Qg0fEI";
testJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXS1MifQ.eyJhdWQiOlsiZnVuY3Rpb25faWQiLCJhcGkuZHJvbmVkZXBsb3kuY29tIl0sImV4cCI6OTYyNTA0NDA2OSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9ibyI6InBsdWdpbl9zbHVnIiwib3JnYW5pemF0aW9uX2lkIjoib3JnX2lkIiwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIiwiZGF0YXN0b3JlIiwiZnVuY3Rpb25zIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.RkX6dJ0E0AxSI8QHwtFkKYof8gLxlnTUVnMc3FS_BgU7yMvOGbZ_TjADEHxAMS0xb7XKMXW_l8MJemfXc7i3sGfWcS6mVppz-sJuOgaibcxmwvTPiKa6Y7d-pwICOQkkRsYOPnJdEjLJr5C8yJyB5rv4ss_cTbCnSgOUtUynhIXeP0iHmhhjdZGzYTGaSpJMIP55V70Yo2reb4NTY5Did31g99ZsyFElyvIRpFxmwjAMA-sDTdvvk9-onhKHfBuO8OWiRstuweFdxGcDNVw_PQH7hduGc71Higa4rda8DA8-XF0XA7r9_zfJtgKrinIF495vEvAmpv6TncE8ZOCUvF6Yv4oo20bsZktvEf1puR8LpZdAbaXT5xLo4UEJAWxFCso_pOOi0xVOZID60dZXjBCzTTUbq0_MBTuiscOHxag7yzxwas4UsBiiK1KWSmUQDUDteN6eC7elCAGMGomz1P74JlnrdIxbbCmjPYKfvuPlKR3nqbftCXx3syP1DPQ2AYawIqD3cB5GhqW4PmjWCvkiLjZzQ0hIKr0_ds9zF-B9U2y8gdJMSZviITifNYltszxA7MWmysSsauigks39l1_T_ux28GLZcCV4RhM9e2ARIkaVT2MESVL4n0jHM52bLfNNrKkqPXB21838plzDYfkOqgrQwyxVXf0BtRHfBJk";
testJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXS1MifQ.eyJhdWQiOlsiZnVuY3Rpb25faWQiLCJhcGkuZHJvbmVkZXBsb3kuY29tIl0sImV4cCI6OTYyNTA0NDA2OSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9ibyI6InBsdWdpbl9zbHVnIiwib3JnYW5pemF0aW9uX2lkIjoib3JnX2lkIiwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.ICsSJxeJllbljBhT8YMefrVtN5aD4rpv8nXOYEUqnG2qo14bZtHlFm6KDn2q84o_ea4FFkmlFSeCO6ol-lBOA_hVoaW1f-WeNID152oeS6s1hL_nJWCEzOCjf8eaztoaInS9OxLpY35LbH0I3KUuq1RCT5IDorKUOJfoEA5QoBLS6nlYEts42Sq8KHoUhshndQgtbdS6iUO53aBMB5HFhjnBMtAePadRfQLP7WtRUUq00P8TdnmZhg0e8dFIA5TF_NHsEHfCX9gwnJjhWs9-hVUbAUPgJL8SC0lmrA5w8vqa6cWpPxUYGnC5CtXP2HI1S8QktvWVqWfWJDYbHYbXiS88dTQLOBvxDBd23Dr03McaRgUnynfvFK3XWZIwGiELBdGhqjMp5Vxu2WMxcywBwnGKsIE4umt5H_0meXlcDF8DixKqWlJvn0TMgAMFReJVjW3UQZdFPttPon-0DZ6h0sGIeyJlvkC2farlXVvRthN1MMTUQdwiNErWTqTVfQqtQQiLr5FO8IjgrjpvKcH3EDPB2p5LkjudtuzrImc7sQYyjslrdbHWYbNPDkrtB5Xhk1IOwM2MrFZBRLEE4cHJN2brJCq7VszochZ1Dob2OoyvrkImxq0Py-n5D5238-MeNF4qsoCY99s-SvoyAr1AwBOb_lfmiJQUetQkK-yGlaU";

let req = {
  headers: {
    'DummyHeader': 'imadummy'
  },
  query: 'jwt_token=' + testJwt
};

let res = {
  headers: [],
  status: () => {
    return {
      send: () => {

      }
    };
  },
  set: (name, value) => {
    res.headers[name] = value;
  }
};

function handler(req, res, ctx) {
  // this is for mocking token.
  ctx.encryptedToken = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbnZpcm9ubWVudCI6InRlc3QiLCJ1c2VybmFtZSI6Im1oZXJuYW5kZXpAZHJvbmVkZXBsb3kuY29tIiwiZXhwIjoxNTI3MDEyNTcyfQ.4s8O7e1ZA9CBAgBwC2Hn9ZXLVZA0hz-ZJFglvvW6tcDOiq9eXA6kbM2Hd5eLLExCermpj_f8VayQ2oSg_nZ3kQ';

  let users = ctx
    .datastore
    .table('Table:5ada2d8f27b7b90001b9c40a');

  // Get the users tables
  users
    // .addRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    // .editRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    .upsertRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    .then(result => {
      console.log(util.inspect(result, {depth: 20, colors: true}));
    })
    .then(() => {
      console.log('fetching datum from datastore');
      users
        .getRowByExternalId('mhernandez+test@dronedeploy.com')
        .then((result) => {
          console.log(util.inspect(result, {depth: 20, colors: true}));
        })

    })
    .catch(e => {
      console.log(e);
    });
}


bootstrap(config, req, res, (err, ctx) => {
  // Common headers should have been set automatically.
  // Common requests like OPTIONS should have been handled automatically.
  // lets hack the jwt token to be the test one
  if (err) {
    console.error(err, err.stack);
    console.warn('An error occurred during the bootstrapping process. A default response has been sent and code paths have been stopped.');
    return;
  }
  handler(req, res, ctx);
});
