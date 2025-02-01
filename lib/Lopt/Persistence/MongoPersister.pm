package Lopt::Persistence::MongoPersister;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use MongoDB;
use UUID::Tiny qw(:std);
use Lopt::Constants qw(
    $MONGO_URL
    $MONGO_DB_NAME
    $MONGO_TASKS_COLLECTION_NAME
    $MONGO_LAST_TASK_COLLECTION_NAME
    $MONGO_RUNNING_TASK_COLLECTION_NAME
    $TASK_DATA_DELIMITER
    $NO_RUNNING_PROCESS
);

use parent qw(Lopt::Persistence::Persister);

my $mongo_client;

sub save_task {
    my ($self) = @_;
    my $task = $self->task();

    $task->{id} = create_uuid_as_string(UUID_V4);
    $self->_get_tasks_collection()->insert_one($task);
    return $task;
}

sub get_tasks {
    my ($self) = @_;
    my $tasks_cursor = $self->_get_tasks_collection()->find();
    my @tasks = $tasks_cursor->all();

    @tasks = map { $self->_remove_mongo_id($_) } @tasks;
    return \@tasks;
}

sub get_task {
    my ($self) = @_;
    my $task = $self->_get_tasks_collection()->find_one({
        id => $self->task_id()
    });
    return undef if !$task;
    return $self->_remove_mongo_id($task);
}

sub update_task {
    my ($self) = @_;
    my $task_id = $self->task_id();
    my $new_task = $self->task();

    my $result = $self->_get_tasks_collection()->update_one(
        { id => $task_id },
        { '$set' => $new_task }
    );
    return undef if !$result;
    return $new_task;
}

sub delete_task {
    my ($self) = @_;
    my $task_id = $self->task_id();

    my $result = $self->_get_tasks_collection()->delete_one(
        { id => $task_id }
    );
    return undef if not $result->deleted_count > 0;
    return 1;
}

sub save_last_executed_task {
    my ($self, $last_task_data) = @_;
    $self->_get_last_task_collection()->replace_one(
        {},
        $last_task_data,
        { upsert => 1 }
    );
    return 1;
}

sub get_last_executed_task {
    my ($self) = @_;
    my $last_task = $self->_get_last_task_collection()->find_one();
    return undef unless $last_task;
    return $self->_remove_mongo_id($last_task);
}

sub delete_last_executed_task {
    my ($self) = @_;
    $self->_get_last_task_collection()->delete_one({});
    return 1;
}

sub get_process_status {
    my ($self) = @_;
    my $task = $self->_get_running_task_collection()->find_one();
    return $NO_RUNNING_PROCESS unless $task;
    return join($TASK_DATA_DELIMITER, ($task->{pid}, $task->{status}, $task->{logfile}));
}

sub save_process_status {
    my ($self, $pid) = @_;
    my ($task_pid, $task_status, $task_logfile) = split(/$TASK_DATA_DELIMITER/, $pid, 3);
    $self->_get_running_task_collection()->replace_one(
        {},
        { pid => $task_pid, status => $task_status, logfile => $task_logfile },
        { upsert => 1 }
    );
    return 1;
}

sub _get_tasks_collection {
    my ($self) = @_;
    $mongo_client ||= _initialize_mongo_client();
    my $db = $mongo_client->get_database($MONGO_DB_NAME);
    return $db->get_collection($MONGO_TASKS_COLLECTION_NAME);
}

sub _get_running_task_collection {
    my ($self) = @_;
    $mongo_client ||= _initialize_mongo_client();
    my $db = $mongo_client->get_database($MONGO_DB_NAME);
    return $db->get_collection($MONGO_RUNNING_TASK_COLLECTION_NAME);
}

sub _get_last_task_collection {
    my ($self) = @_;
    $mongo_client ||= _initialize_mongo_client();
    my $db = $mongo_client->get_database($MONGO_DB_NAME);
    return $db->get_collection($MONGO_LAST_TASK_COLLECTION_NAME);
}

sub _initialize_mongo_client {
    return MongoDB->connect($MONGO_URL);
}

sub _remove_mongo_id {
    my ($self, $task) = @_;
    delete $task->{_id} if exists $task->{_id};
    return $task;
}

1;
