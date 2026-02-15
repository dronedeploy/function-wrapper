const assert = require('assert');
const sinon = require('sinon');

process.env.APP_ID = 'function_id';
process.env.DDENV = 'test';
process.env.VCR_MODE = 'playback';

const authentication = require('../lib/authentication');
const wrapper = require('../');
const sepia = require('sepia');

sepia.configure({ debug: true });

describe('Authentication', function() {
  const ENCRYPTED_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXS1MifQ.eyJhdWQiOlsiZnVuY3Rpb25faWQiLCJhcGkuZHJvbmVkZXBsb3kuY29tIl0sImV4cCI6OTYyNTA0NDA2OSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9ibyI6InBsdWdpbl9zbHVnIiwib3JnYW5pemF0aW9uX2lkIjoib3JnX2lkIiwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.ICsSJxeJllbljBhT8YMefrVtN5aD4rpv8nXOYEUqnG2qo14bZtHlFm6KDn2q84o_ea4FFkmlFSeCO6ol-lBOA_hVoaW1f-WeNID152oeS6s1hL_nJWCEzOCjf8eaztoaInS9OxLpY35LbH0I3KUuq1RCT5IDorKUOJfoEA5QoBLS6nlYEts42Sq8KHoUhshndQgtbdS6iUO53aBMB5HFhjnBMtAePadRfQLP7WtRUUq00P8TdnmZhg0e8dFIA5TF_NHsEHfCX9gwnJjhWs9-hVUbAUPgJL8SC0lmrA5w8vqa6cWpPxUYGnC5CtXP2HI1S8QktvWVqWfWJDYbHYbXiS88dTQLOBvxDBd23Dr03McaRgUnynfvFK3XWZIwGiELBdGhqjMp5Vxu2WMxcywBwnGKsIE4umt5H_0meXlcDF8DixKqWlJvn0TMgAMFReJVjW3UQZdFPttPon-0DZ6h0sGIeyJlvkC2farlXVvRthN1MMTUQdwiNErWTqTVfQqtQQiLr5FO8IjgrjpvKcH3EDPB2p5LkjudtuzrImc7sQYyjslrdbHWYbNPDkrtB5Xhk1IOwM2MrFZBRLEE4cHJN2brJCq7VszochZ1Dob2OoyvrkImxq0Py-n5D5238-MeNF4qsoCY99s-SvoyAr1AwBOb_lfmiJQUetQkK-yGlaU";
  
  const DECRYPTED_JWT_JSON = `{
    "aud": [
      "function_id",
      "api.dronedeploy.com"
    ],
    "exp": 9625044069,
    "iss": "api.dronedeploy.com",
    "obo": "plugin_slug",
    "organization_id": "org_id",
    "scope": [
      "payments",
      "user_information"
    ],
    "sub": "User:56b0fd4d4561f5000f2f131e"
  }`;
  
  const DECRYPTED_JWT = JSON.parse(DECRYPTED_JWT_JSON);
  
  const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA8p7EOTnjovs8vjCJzraG
SGEJ7K/5u4ipearfxR+y0mfhLk8lk55e+iTPIyUDFqTLk3ssb6QseUvoyQUOR9qn
P4hSW6ZkH4mc8k4i5l8AOZPdkO4jQUe8AsHvyK+Sp+RIHlFmPjzqHtKy+TQUzKDq
PkmFKeWJqym/yhW8aCJBJPHRYcEJJtvKu7w1S4flKKgEAZBFKn036oaR7KMiXXmJ
owiJ9ujOyneC8bHvomimmA6Ps8UssZMuwEubsWdJ2KR3Y+iYSZXd9XiG19Rswm/M
kVZEEXiCcWCsqr38h1mvRlp0gd3+7G+6MqaEGw9RM6VNyWceogR7BTwP5EAsi02k
DwJAcsbpZCFjy/1nVnjOoZ7NzzDmQiycEQLKoy3D61hmGXI+V8ZE3cNFYiaUYCmi
ZNaZAPvEqtSH9D2h9ywLEvDXm3RqPPs82DvmJO7/dfaPoWoZyEQPIaDPJv0F+gwz
UVw2eAo7Rte27004d391xZUQOdFbBbMl01rOzDBmEOGg1vEWAX9ArDj65JHoNc4k
FQlSSafB9Yt0wqqwcWSKUk+kzxnin/znlJBDk5iS7j+KI00sVYRujUkQpQblUI3m
6R7KHmAezhY9lB/UOiLYfo5F3A7zWBjw5OSadLOBP+PAs3MTDyDSowkf2eHs0skp
Nv9fPDAo1fic4xNbplUH3jcCAwEAAQ==
-----END PUBLIC KEY-----`;

  const WRONG_ENCRYPTED_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvYm8iOiJwbHVnaW5fc2x1ZyIsImF1ZCI6WyJmdW5jdGlvbl9pZCIsImFwaS5kcm9uZWRlcGxveS5jb20iXSwiaXNzIjoiYXBpLmRyb25lZGVwbG95LmNvbSIsIm9yZ2FuaXphdGlvbl9pZCI6Im9yZ19pZCIsImV4cCI6MTYyNTA0NDA2OSwic2NvcGUiOlsicGF5bWVudHMiLCJ1c2VyX2luZm9ybWF0aW9uIl0sInN1YiI6IlVzZXI6NTZiMGZkNGQ0NTYxZjUwMDBmMmYxMzFlIn0.OIrad7oVWaZmQ5YgZ2bmq961w9-3vaf_6vQabsI6E_1QGwxBdzo6tuesQo0kZe3QxyOUskoGggAFWW337zNAebcYZMxka6MwgElDIu7tdQ-5S6991vRN37KsReVlelqY78GMG_ohVb1iaXee0jplFNy_1S_Y3fx0ZvVdtVE99zdXukCfw4-tRQmtJq3LDi2PsifixeAoBatzgsoEefHYpdCEek-RD9CRWmeNDGz9Dd5May0_oruCFrxk9yagwdw6_TdhjY6Ti6aYZQGVF4l3xrZl8uvmxZZDZYCFB3aSeee8vlYHeecrLZTPv7HFRKhI2x-CIrxNbBs3L8EoBc2xp9e4MKEWiv-UyXtLzdw1OgGpwH3SdqBmj4-COYT5uFgV6bWVz-zYTHLcGGn1-BAOPjBMCfeCfKXjcEzjoCgIsULhV3NdAOdPu_GSCppyRd_O3whGTHvLihgxd8LoeZ5FdQlBvjbQMQ-6yiw92juE8LJSFOnQ9995lOeTfyN2Hzv0ovw4QMnTnWgXCb3YTmmmbTkpidSfGCXtgsiemwAecTD9tF8VMU-lEIH-5v0mOZWz-6a2LKl8hkSdjm2i8l3Dz1oeoZrW_sQkFatLeSGUZb2l0VeVvpN66oTfZB8_n78APEjeqfOrEsaxrBtigaDXbGq8OvW2-poPJb2Z4Q-tsDE";

  describe('#decryptTokenWithKeys()', function() {
    it('should return JWT plaintext when correct token and key are provided', function() {
      const jwt = authentication.decryptTokenWithKeys(ENCRYPTED_JWT, [PUBLIC_KEY]);
      assert.deepStrictEqual(jwt, DECRYPTED_JWT);
    });

    it('should raise error when key is not provided', function() {
      assert.throws(
        function() {
          const wrongKey = '';
          authentication.decryptTokenWithKeys(ENCRYPTED_JWT, [wrongKey]);
        },
        /^JsonWebTokenError: secret or public key must be provided$/
      );
    });

    it('should raise invalid signature error when token created with wrong private key', function() {
      assert.throws(
        function() {
          authentication.decryptTokenWithKeys(WRONG_ENCRYPTED_JWT, [PUBLIC_KEY]);
        },
        /^JsonWebTokenError: invalid signature$/
      );
    });
  });

  describe('wrapper', function() {
    let sandbox;

    describe('checkAuthentication', function() {
      beforeEach(function() {
        sandbox = sinon.createSandbox();
      });

      afterEach(function() {
        sandbox.restore();
      });

      it('should not fail with valid authentication', function(done) {
        const config = { authRequired: true };
        const res = {
          status: () => ({ send: () => {} })
        };
        const ctx = {};

        wrapper.__checkAuthentication(config, res, ENCRYPTED_JWT, ctx, (err, ctx) => {
          assert.equal(err, null);
          assert.notEqual(ctx, null);
          assert.notEqual(ctx, undefined);
          done(err);
        });
      });

      it('should propagate rejection errors', function(done) {
        const config = { authRequired: true };
        const res = {
          status: () => ({ send: () => {} })
        };
        const ctx = {};
        
        sandbox.stub(wrapper, '__getPublicKeys').returns(Promise.resolve(['wrong keys']));
        
        wrapper.__checkAuthentication(config, res, ENCRYPTED_JWT, ctx, (err, ctx) => {
          assert.equal(ctx, undefined);
          assert.equal(err.message, 'Authentication Error: Could not decrypt token with any of the public keys, please contact support@dronedeploy.com');
          done();
        });
      });

      it('should return invalid audience error', function(done) {
        const config = { authRequired: true };
        const res = {
          status: () => ({ send: () => {} })
        };
        const ctx = {};
        
        sandbox.stub(wrapper, '__getPublicKeys').returns(Promise.resolve([PUBLIC_KEY]));
        sinon.stub(wrapper, '__verifyAudience').returns(false);
        
        wrapper.__checkAuthentication(config, res, ENCRYPTED_JWT, ctx, (err, ctx) => {
          assert.equal(ctx, undefined);
          assert.equal(err.message, "Authentication Error: Token's audience function_id,api.dronedeploy.com did not match any for this function.");
          done();
        });
      });
    });
  });

  describe('#verifyAudience()', function() {
    let oldAppSlug, oldFunctionId;

    before(function() {
      oldAppSlug = global.APP_ID;
      oldFunctionId = global.FUNCTION_ID;
    });

    afterEach(function() {
      global.APP_ID = oldAppSlug;
      global.FUNCTION_ID = oldFunctionId;
    });

    it('should return true when expected audience is present in token', function() {
      const audiences = ['function_id'];
      const result = authentication.verifyAudience(DECRYPTED_JWT, audiences);
      assert.equal(result, true);
    });

    it('should return false when expected audience is not present in token', function() {
      const audiences = ['0U812', 'an audience for me?'];
      const result = authentication.verifyAudience(DECRYPTED_JWT, audiences);
      assert.equal(result, false);
    });

    it('should use global.FUNCTION_ID when audiences not provided', function() {
      global.FUNCTION_ID = 'function_id';
      const result = authentication.verifyAudience(DECRYPTED_JWT);
      assert.equal(result, true);
    });

    it('should use global.APP_ID when audiences not provided', function() {
      global.APP_ID = 'api.dronedeploy.com';
      const result = authentication.verifyAudience(DECRYPTED_JWT);
      assert.equal(result, true);
    });
  });

  describe('#getPublicKeys()', function() {
    const KEYS_RESPONSE = [`-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA8p7EOTnjovs8vjCJzraG
SGEJ7K/5u4ipearfxR+y0mfhLk8lk55e+iTPIyUDFqTLk3ssb6QseUvoyQUOR9qn
P4hSW6ZkH4mc8k4i5l8AOZPdkO4jQUe8AsHvyK+Sp+RIHlFmPjzqHtKy+TQUzKDq
PkmFKeWJqym/yhW8aCJBJPHRYcEJJtvKu7w1S4flKKgEAZBFKn036oaR7KMiXXmJ
owiJ9ujOyneC8bHvomimmA6Ps8UssZMuwEubsWdJ2KR3Y+iYSZXd9XiG19Rswm/M
kVZEEXiCcWCsqr38h1mvRlp0gd3+7G+6MqaEGw9RM6VNyWceogR7BTwP5EAsi02k
DwJAcsbpZCFjy/1nVnjOoZ7NzzDmQiycEQLKoy3D61hmGXI+V8ZE3cNFYiaUYCmi
ZNaZAPvEqtSH9D2h9ywLEvDXm3RqPPs82DvmJO7/dfaPoWoZyEQPIaDPJv0F+gwz
UVw2eAo7Rte27004d391xZUQOdFbBbMl01rOzDBmEOGg1vEWAX9ArDj65JHoNc4k
FQlSSafB9Yt0wqqwcWSKUk+kzxnin/znlJBDk5iS7j+KI00sVYRujUkQpQblUI3m
6R7KHmAezhY9lB/UOiLYfo5F3A7zWBjw5OSadLOBP+PAs3MTDyDSowkf2eHs0skp
Nv9fPDAo1fic4xNbplUH3jcCAwEAAQ==
-----END PUBLIC KEY-----`];

    let oldEnv;

    before(function() {
      oldEnv = global.ENV;
    });

    afterEach(function() {
      global.ENV = oldEnv;
    });

    it('should return public keys array when invoked', function() {
      global.ENV = 'test';
      
      return authentication.getPublicKeys()
        .then(function(result) {
          assert.deepEqual(result, KEYS_RESPONSE);
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
