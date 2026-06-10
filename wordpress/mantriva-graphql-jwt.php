<?php
/**
 * Mantriva — WPGraphQL JWT Authentication bootstrap
 *
 * Install: copy to wp-content/mu-plugins/mantriva-graphql-jwt.php
 * (create wp-content/mu-plugins/ if needed).
 *
 * Enables the GraphQL `login` mutation for the Mantriva Next.js storefront.
 * Uses WPGraphQL JWT Authentication — NOT the REST JWT plugin.
 *
 * If GRAPHQL_JWT_AUTH_SECRET_KEY is missing from wp-config.php, this file
 * derives a secret from WordPress core salts (AUTH_KEY + SECURE_AUTH_KEY).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve a JWT signing secret for WPGraphQL JWT Authentication.
 */
function mantriva_graphql_jwt_secret(): string {
	if (
		defined( 'GRAPHQL_JWT_AUTH_SECRET_KEY' )
		&& ! empty( GRAPHQL_JWT_AUTH_SECRET_KEY )
		&& GRAPHQL_JWT_AUTH_SECRET_KEY !== 'graphql-jwt-auth'
	) {
		return GRAPHQL_JWT_AUTH_SECRET_KEY;
	}

	if ( defined( 'AUTH_KEY' ) && defined( 'SECURE_AUTH_KEY' ) ) {
		return AUTH_KEY . SECURE_AUTH_KEY;
	}

	return '';
}

$mantriva_jwt_secret = mantriva_graphql_jwt_secret();

if ( $mantriva_jwt_secret && ! defined( 'GRAPHQL_JWT_AUTH_SECRET_KEY' ) ) {
	define( 'GRAPHQL_JWT_AUTH_SECRET_KEY', $mantriva_jwt_secret );
}

add_filter(
	'graphql_jwt_auth_secret_key',
	function ( $secret ) {
		$resolved = mantriva_graphql_jwt_secret();
		return $resolved ? $resolved : $secret;
	},
	9
);
