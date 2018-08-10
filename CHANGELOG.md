CHANGELOG
=============

Release 1.1.3

- Addded Typescript typings

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
