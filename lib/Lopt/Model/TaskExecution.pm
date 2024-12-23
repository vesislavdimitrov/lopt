package Lopt::Model::TaskExecution;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Model::Request);

my $TASK_MODEL = {
    password => qr{\A.*\z}
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