<?php
/**
 * Plugin Name: Mantriva Headless Auth
 * Description: Enables WPGraphQL JWT Authentication for the Mantriva Next.js storefront. Sets the JWT signing secret when missing from wp-config.php.
 * Version: 1.0.0
 * Author: Mantriva
 * Requires PHP: 7.4
 * Requires at least: 6.0
 *
 * Install: WordPress Admin → Plugins → Add New → Upload Plugin → select mantriva-headless-auth.zip
 * Or copy this folder to wp-content/plugins/mantriva-headless-auth/
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve JWT signing secret for WPGraphQL JWT Authentication.
 */
function mantriva_headless_auth_secret(): string {
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

$mantriva_secret = mantriva_headless_auth_secret();

if ( $mantriva_secret && ! defined( 'GRAPHQL_JWT_AUTH_SECRET_KEY' ) ) {
	define( 'GRAPHQL_JWT_AUTH_SECRET_KEY', $mantriva_secret );
}

add_filter(
	'graphql_jwt_auth_secret_key',
	function ( $secret ) {
		$resolved = mantriva_headless_auth_secret();
		return $resolved ? $resolved : $secret;
	},
	9
);

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'mantriva/v1',
			'/auth-health',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function () {
					$secret = mantriva_headless_auth_secret();
					$configured = ! empty( $secret ) && $secret !== 'graphql-jwt-auth';

					return array(
						'ok'                    => $configured,
						'jwt_secret_configured' => $configured,
						'auth_method'           => 'WPGraphQL JWT Authentication (GraphQL login mutation)',
						'graphql_endpoint'      => home_url( '/graphql' ),
						'rest_jwt_plugin'       => false,
					);
				},
			)
		);
	}
);
