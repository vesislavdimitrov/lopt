package Lopt::Persistence::JSONPersister;

use Dancer2 appname => 'Lopt';
use File::JSON::Slurper qw(read_json write_json);
use Lopt::Constants;

use parent qw(Lopt::Persistence::BasePersister);

sub save_task {
    my ($self) = @_;
    my $task_id = 1;
    my $tasks = $self->get_tasks();
    if(@{$tasks} > 0) {
        $task_id = $tasks->[-1]{'id'} + 1;
    }
    $self->task()->{'id'} = $task_id;
    push @{$tasks}, $self->task();
    write_json($TASKS_FILENAME_JSON, $tasks);
    return $self->task();
}

sub get_tasks {
    my ($self) = @_;
    my $json = eval { read_json($TASKS_FILENAME_JSON) };
    if(!defined $json) {
        return [];
    }
    return $json;
}

sub get_task {
    my ($self) = @_;
    my $tasks = $self->get_tasks();
    foreach my $task (@{$tasks}) {
        if($task->{'id'} == $self->task_id()) {
            return $task;
        }
    }
    return undef;
}

sub update_task {
    my ($self) = @_;
    my $tasks = $self->get_tasks();
    foreach my $task (0..$#{$tasks}) {
        if($tasks->[$task]->{'id'} == $self->task_id()) {
            my $old_task_id = $tasks->[$task]->{'id'};
            $tasks->[$task] = $self->task();
            $tasks->[$task]->{'id'} = $old_task_id;
            write_json($TASKS_FILENAME_JSON, $tasks);
            return $tasks->[$task];
        }
    }
    return undef;
}

sub delete_task {
    my ($self) = @_;
    my $tasks = $self->get_tasks();
    foreach my $task (0..$#{$tasks}) {
        if($tasks->[$task]->{'id'} == $self->task_id()) {
            splice @{$tasks}, $task, 1;
            write_json($TASKS_FILENAME_JSON, $tasks);
            return 1;
        }
    }
    return undef;
}

1;