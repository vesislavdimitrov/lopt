# The good, the bad, but most importantly, the ugly
package Lopt::Controllers::Utils;

use strict;
use warnings;

use MIME::Base64;
use Lopt::Validation qw(authenticate_user has_basic_auth);

use parent qw(Exporter);

our @EXPORT_OK=qw(
    get_debug_message
    get_success_message
    get_warning_message
    get_banned_method_message
    get_unsecure_request_message
    get_auth_error
    authorize
    encode
);

sub authorize {
    my ($request) = @_;
    my $auth_header = $request->header('Authorization');
    
    return 0 if !has_basic_auth($auth_header) || !authenticate_user((split ' ', $auth_header)[1]);
    return 1;
}

sub encode {
    my ($string) = @_;
    return encode_base64($string, '');
}

sub get_auth_error {
    my ($request) = @_;
    return Lopt::Model::Exception->new(401, get_unsecure_request_message($request))
        ->get_hash();
}

sub get_debug_message {
    my ($request) = @_;
    my $method = $request->method();
    my $request_path = $request->path();
    return "Received $method at $request_path";
}

sub get_success_message {
    my ($request) = @_;
    my $method = $request->method();
    my $request_path = $request->path();
    return "$method successful at $request_path";
}

sub get_warning_message {
    my ($request) = @_;
    my $method = $request->method();
    my $request_path = $request->path();
    return "$method failed at $request_path";
}

sub get_banned_method_message {
    my ($request) = @_;
    my $method = $request->method();
    my $request_path = $request->path();
    return "Received a disallowed method $method at $request_path";
}

sub get_unsecure_request_message {
    my ($request) = @_;
    my $method = $request->method();
    my $request_path = $request->path();
    return "Received an unsecure $method request at $request_path";
}

1;