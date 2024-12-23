package Lopt::Model::Task;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Model::Request);

my $TASK_MODEL = {
    command => qr{\A.+\z},
    description => qr{\A.+\z},
    parameters => qr{\A.*\z},
    username => qr{\A.*\z},
    environment_vars => {
        not_actual_keys => 1,
        key => qr{\A[a-zA-Z_]+[a-zA-Z0-9_]*\z},
        value => qr{\A.+\z}
    }
};

sub new {
    my ($class, $task) = @_;
    return $class->SUPER::new($task);
}

sub check_validity {
    my ($self) = @_;
    return $self->validate($self->data(), $TASK_MODEL);
}

1;