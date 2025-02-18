package Lopt::Persistence::Persister;

use Dancer2 appname => 'Lopt';
use POSIX;
use File::JSON::Slurper qw(read_json write_json);
use File::Slurper qw(read_text);
use Lopt::Constants;
use File::HomeDir;

sub new {
    my ($class, $task_id, $task) = @_;
    my $self = {
        task => $task,
        task_id => $task_id
    };
    bless $self, $class;
}

sub task {
    my ($self) = @_;
    return $self->{task};
}

sub task_id {
    my ($self) = @_;
    return $self->{task_id};
}

sub save_execution {
    my ($self, $log_dir, $execution) = @_;
    write_json("$log_dir/$TASK_EXECUTION_PARAMS_FILE", $execution);
    return 1;
}

sub read_log {
    my ($self, $log_filename) = @_;
    return eval { read_text($log_filename) };
}

1;