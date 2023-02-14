CHANGELOG
=============

Release 1.0.0
- Known Issues
  - Environment Flag always resolves to `prod`
- Changes
  - Initial Release


Release 1.0.1
- Known Issues
  - None Currently ( Report any via GH issues )
- Changes
  - Fixes environment flag processing and environment urls for api's.
  - Changed environment flag from NODE_ENV to DDENV

Release 1.0.2
- Known Issues
  - None Currently ( Report any via GH issues )
- Breaking Private API Changes ( Warned in README.md )
  - encryptedToken changed to originalToken
    - This will break any mock token code until you change this reference.
    - Reference README.md for change.

Release 1.0.3
- Known Issues
  - None Currently ( Report any via GH issues )
- Changes
  - Dependency versions have been changed to be more restrictive.
  - Removed production dependency `express`
  - Updated package-lock.json as well.

Release 1.1.0
- Known Issues
  - None Currently ( Report any via GH issues )
- Changes
  - New Method ctx.as(token) allows the ability to switch context to a different user, for instance the user whom owns the plugin. Provided you have the token for that user.
  - ctx.as (for owner users) also exposes a new ctx.datastore method. `ctx.datastore.ensure`.
  This method ensures that a table is created and its columns are created.

Release 1.1.1
- Known Issues
  - None Currently ( Report any via GH issues )
- Changes
  - Add authentication support for parsing a JSON object with `jwt_token` field in the state query param

Release 1.1.3
- Added Typescript typings

Release 1.1.4
- Fix issues with Datastore typings

Release 1.1.5
- Changes 
  - Remove authentication support for parsing JSON object in state query param
  - Add ability to bypass auth for specific routes

Release 1.1.6
- Changes
  - Bug fix on array element check for route check

Release 1.1.7
- Changes
  - Simplified function-wrapper `bootstrap` function (non-backwards compatable)
  - Update dependencies to address security vulnerability
  - Allow definition of custom CORS headers in `CORS_HEADERS` environment variable

Release 1.2.5
- Changes
  - Fixed support for ignored auth routes

Release 1.3.2
- Changes
  - Added logging to authentication flow to help customers better understand any issues

Release 1.3.3
- Changes
  - Bump jsonwebtoken from 8.2.2 to 9.0.0

Release 1.3.4
- Changes
  - Bump express from ^4.16.3 to 4.18.2 and @types/express from ^4.16.0 to 4.17.17
