package Lopt::Validation;

use strict;
use warnings;

use IO::File;
use Exporter qw(import);
use MIME::Base64;
use Authen::Simple::Passwd;
use Lopt::Constants;

our @EXPORT = qw(
    validate_id
    authenticate_user
    has_basic_auth
    verify_credentials
    verify_username
    is_shell_script
);

sub validate_id {
    my ($id) = @_;
    my $uuid_regex = qr/$UUID_PATTERN/;
    return $id =~ $uuid_regex;
}

sub authenticate_user {
    my ($base64_string) = @_;

    my $decoded = decode_base64($base64_string);
    my ($username, $password) = split(':', $decoded, 2);

    my $auth = Authen::Simple::Passwd->new( path => $SHADOW_PATH );
    return $auth->authenticate($username, $password);
}

sub has_basic_auth {
    my ($auth_header) = @_;
    return $auth_header && $auth_header =~ /^Basic*/;
}

sub verify_credentials {
    my ($username, $password) = @_;
    return 1 if !length($username);

    my $shadow_fh = _get_shadow_fh();

    while(my $line = <$shadow_fh>) {
        my @userdata = split(/:/, $line);
        my $encrypted_password = $userdata[1];
        
        # Capture the full salt including algorithm and rounds, if they are present.
        my ($algorithm, $rounds, $pass_salt) = (split(/\$/, $encrypted_password))[1, 2, 3];
        my $full_salt = defined $rounds ? "\$${algorithm}\$${rounds}\$${pass_salt}\$" : "\$${algorithm}\$${pass_salt}\$";
        
        my $new_enc_pass = "";
        if(!length($password)) {
            $new_enc_pass = $encrypted_password if $encrypted_password =~ /\A!/;
        } elsif(defined $pass_salt) { 
            $new_enc_pass = crypt($password, $full_salt);
        }
        return 1 if $userdata[0] eq $username and $encrypted_password eq $new_enc_pass;
    }
    return 0;
}

sub verify_username {
    my ($username) = @_;
    return 1 if !length($username);

    my $shadow_fh = _get_shadow_fh();

    while(my $line = <$shadow_fh>) {
        my @userdata = split(/:/, $line);
        return 1 if $userdata[0] eq $username and $userdata[1] =~ /\A!|\$/;
    }
    return 0;
}

sub is_shell_script {
    my ($file) = @_;
    return $file =~ /\.sh$/;
}

sub _get_shadow_fh {
    return (IO::File->new($SHADOW_PATH, 'r')
        or die "Cannot verify credentials using $SHADOW_PATH file: $!");
}

1;
