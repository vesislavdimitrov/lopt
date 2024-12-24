# The good, the bad, but most importantly, the ugly
package Lopt::Controllers::Utils;

use strict;
use warnings;

use parent qw(Exporter);

our @EXPORT_OK=qw(
    get_debug_message
    get_success_message
    get_warning_message
    get_banned_method_message
);

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

1;