package Lopt::Models::UserModel;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Models::RequestModel);

my $USER_MODEL = {
    username => qr{^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$},
    password => qr{\A.+\z},
    uid => qr{\A\d*\z}
};

sub new {
    my ($class, $user) = @_;
    return $class->SUPER::new($user);
}

sub check_validity {
    my ($self) = @_;
    return $self->validate($self->data(), $USER_MODEL);
}

1;