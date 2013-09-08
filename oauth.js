/**
 * Module dependencies
 */

var request			= require('request'),
	_				= require('lodash'),
	querystringify	= require('querystring').stringify,
	Err				= require('./errors'),
	toCSV			= require('./util/toCSV');





/**
 * OAuth logic
 */

module.exports = {


	/**
	 * Get the authentication url where your user should be redirected
	 *
	 * @param {String} appId			(your Deezer application id from the Deezer developer portal)
	 * @param {String} redirectUrl		(URL which will handle the user's code from Deezer)
	 * @param {Array|undefined} perms	(requested permissions [optional])
	 *
	 * NOTE: `redirectUrl` must be within the 'Application domain' specified for this app 
	 * in your Deezer developer portal at: http://developers.deezer.com/myapps
	 */

	getLoginUrl: function (appId, redirectUrl, perms) {
		if ( typeof appId !== 'string' && typeof appId !== 'number' ) {
			throw Err.invalidArgument('appId', appId, ['string', 'number']);
		}
		if ( typeof redirectUrl !== 'string' ) {
			throw Err.invalidArgument('redirectUrl', redirectUrl, ['string']);
		}
		if ( !_.isArray(perms) && typeof perms !== 'undefined' ) {
			throw Err.invalidArgument('perms', perms, ['Array', 'undefined']);
		}

		// If unspecified, basic_access is used by default
		// (Deezer does this under the covers anyway)
		if (!perms) perms = ['basic_access'];

		// Reduce `perms` into a comma-separated-value string
		perms = toCSV(perms);

		// Build set of parameters to send to the authentication endpoint
		// to verify that the user whose account you'd like to access
		// is on board and cool w/ it and everything
		// Then return the ready-to-go URL:
		return this.authenticationUrl +
			'?' + querystringify({
				app_id			: appId,
				redirect_uri	: redirectUrl,
				perms			: perms
			});
	},




	/**
	 * Generate an access token to access a user's Deezer account
	 *
	 * > NOTE: You must first have a valid `code` from the user proving that they're OK with this!!
	 * > You can get a code by redirecting the user to the url generated by calling `DZ.getLoginUrl(appId, callbackUrl)`
	 * > You'll probably want to call `DZ.createSession()` from the handler for the `callbackUrl` you specified
	 * > in `getLoginUrl(appId, callbackUrl)`, since that's where you'll have access to the `code`
	 *
	 * @param {String} code			(the OAuth `code` generated by Deezer and sent to the `callbackUrl`)
	 * @param {String} appSecret	(your Deezer app's secret from the developer portal)
	 * @param {Function} cb
	 *		@param {Error|null} err
	 */
	
	createSession: function (accessToken, cb) {
		// TODO: stub
	},
	



	/**
	 * Lookup the validity of a Deezer user session for your app (i.e. access token)
	 *
	 * @param {String} accessToken		(the OAuth token representing a user's session)
	 * @param {Function} cb
	 *		@param {Error|null} err
	 */
	
	checkSession: function (accessToken, cb) {

		// Doesn't appear to be a way to do this,
		// at least in the current API doc here:
		// http://developers.deezer.com/api
		throw errors.notYetSupported('checkSession');
	},



	/**
	 * Invalidate/destroy the specified user's session
	 *
	 * @param {String} accessToken		(the OAuth token representing a user's session)
	 * @param {Function} cb
	 *		@param {Error|null} err
	 */
	
	destroySession: function (accessToken, cb) {

		// Doesn't appear to be a way to do this,
		// at least in the current API doc here:
		// http://developers.deezer.com/api
		throw errors.notYetSupported('destroySession');
	}
};



/**
 * Available Permissions:
 * (as of Saturday, Sep 7, 2013)
 * (from http://developers.deezer.com/api/permissions)
 *
 * basic_access
 * email
 * offline_access
 * manage_library
 * manage_community
 * delete_library
 * listening_history
 */
