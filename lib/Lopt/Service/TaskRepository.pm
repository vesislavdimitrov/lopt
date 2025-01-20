package Lopt::Service::TaskRepository;

use Dancer2 appname => 'Lopt';
use Lopt::Persistence::MongoPersister;

use parent qw(Lopt::Service::Repository);

sub new {
    my ($class, $task_id, $task) = @_;
    my $self = {
        persister => Lopt::Persistence::MongoPersister->new($task_id, $task),
    };
    bless $self, $class;
}

sub create {
    my ($self) = @_;
    return $self->persister()->save_task();
}

sub fetch {
    my ($self) = @_;
    return $self->persister()->get_task() if defined $self->persister()->task_id();
    return $self->persister()->get_tasks();
}

sub update {
    my ($self) = @_;
    return $self->persister()->update_task();
}

sub delete {
    my ($self) = @_;
    return $self->persister()->delete_task();
}

1;