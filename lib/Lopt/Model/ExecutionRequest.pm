package Lopt::Model::ExecutionRequest;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Model::Request);

my $EXECUTION_MODEL = {
    password => qr{\A.*\z}
};

sub new {
    my ($class, $execution) = @_;
    return $class->SUPER::new($execution);
}

sub check_validity {
    my ($self) = @_;
    return $self->validate($self->data(), $EXECUTION_MODEL);
}

1;
