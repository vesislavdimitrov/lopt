package Lopt::Models::UserDeletionModel;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Models::RequestModel);

my $USER_MODEL = {
    delete_home => qr{\A0|1\z}
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