package Lopt::Persistence::PersisterFactory;

use Dancer2 appname => 'Lopt';
use Lopt::Persistence::JSONPersister;
use Lopt::Persistence::MongoPersister;
use Lopt::Constants;

sub create {
    my ($task_id, $task) = @_;
    my $persistence = $ENV{$PERSISTENCE_VARIABLE_NAME};
    return Lopt::Persistence::MongoPersister->new($task_id, $task);
}

1;