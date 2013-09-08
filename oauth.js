/**
 * Module dependencies
 */

var request			= require('request'),
	_				= require('lodash'),
	querystring		= require('querystring'),
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
		return this.endpoints.userAuth +
			'?' + querystring.stringify({
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
	 * @param {String} appId		(your Deezer application id from the Deezer developer portal)
	 * @param {String} code			(the OAuth `code` generated by Deezer and sent to the `callbackUrl`)
	 * @param {String} secret		(your Deezer app's secret from the developer portal)
	 * @param {Function} cb
	 *		@param {Error|null} err
	 */
	
	createSession: function (appId, secret, code, cb) {
		if ( typeof appId !== 'string' && typeof appId !== 'number' ) {
			throw Err.invalidArgument('appId', appId, ['string', 'number']);
		}
		if ( typeof code !== 'string' ) {
			throw Err.invalidArgument('code', code, ['string']);
		}
		if ( typeof secret !== 'string' ) {
			throw Err.invalidArgument('secret', secret, ['string']);
		}
		if ( !_.isFunction(cb) ) {
			throw Err.invalidArgument('cb', cb, ['Function']);
		}

		// Communicate w/ Deezer
		request.get({
			url		: this.endpoints.accessToken,
			qs		: {
				app_id	: appId,
				secret	: secret,
				code	: code
			}
		}, function createSessionResponse (err, r, body) {

			// Handle non-200 status codes & unexpected results
			if (err) return cb(err);
			var status = r.statusCode;
			if (status !== 200 && body) return cb(body);
			if (!body) return cb(Err.unknownResponseFromDeezer(r));
			// NOTE: When an error API is documented for Deezer OAuth API calls,
			// a more structured/semantic error response should be implemented here

			// Attempt to parse response body as form values
			// (see example here: http://developers.deezer.com/api/oauth)			
			var parsedResponse = querystring.parse(body);
			if (!parsedResponse.access_token) return cb(body);
			
			// Cast `expires` result to either `0` or a natural number ( > 0 )
			// i.e. we'll allow the `expires` value to be missing from the response,
			// but we assume that means the token *never* expires!
			if (!parsedResponse.expires) parsedResponse.expires = 0;
			
			// Trim whitespace
			if (typeof parsedResponse.expires === 'string') {
				parsedResponse.expires.replace(/\s*/g, '');
			}
			// Cast to number
			parsedResponse.expires = +parsedResponse.expires;
			
			// NOTE: `expires` represents the number of seconds remaining before 
			// the access token expires
			
			// Send back parsed response
			cb(null, {
				accessToken	: parsedResponse.access_token,
				expires		: parsedResponse.expires
			});
		});
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
