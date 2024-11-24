package Lopt::Execution::TaskExecution;

use Dancer2 appname => 'Lopt';
use POSIX;
use File::Path qw(make_path);
use File::Basename qw(basename fileparse);
use IO::Pipe;
use Lopt::Constants;
use Lopt::Persistence::PersisterFactory;

sub new {
    my ($class, $id, $task, $pid) = @_;
    my $self = {
        id => $id,
        task => $task,
        pid => $pid,
        persister => Lopt::Persistence::PersisterFactory::create(),
        log_dir => undef,
        log_filename => undef,
        log_fh => undef
    };
    bless $self, $class;
}

sub get_user {
    my ($self) = @_;
    return scalar getpwuid $<;
}

sub id {
    my ($self) = @_;
    return $self->{id};
}

sub task {
    my ($self) = @_;
    return $self->{task};
}

sub pid {
    my ($self) = @_;
    return $self->{pid};
}

sub log_dir {
    my ($self) = @_;
    return $self->{log_dir};
}

sub persister {
    my ($self) = @_;
    return $self->{persister};
}

sub log_filename {
    my ($self) = @_;
    return $self->{log_filename};
}

sub log_fh {
    my ($self) = @_;
    return $self->{log_fh};
}

sub set_id {
    my ($self, $id) = @_;
    return $self->{id} = $id;
}

sub set_task {
    my ($self, $task) = @_;
    return $self->{task} = $task;
}

sub set_pid {
    my ($self, $pid) = @_;
    return $self->{pid} = $pid;
}

sub execute {
    my ($self) = @_;

    ($self->{log_dir}, $self->{log_filename}, $self->{log_fh}) = $self->create_logfile();

    my $exit_code = $self->execute_task();

    $self->persister()->save_last_task({ log_file => $self->log_filename(), exit_code => $exit_code });
    $self->persister()->save_execution($self->log_dir(), { log_file => './' . basename($self->log_filename()), exit_code => $exit_code });

    $self->log_fh()->close() 
        or die "Could not close file $self->log_filename: $!";
    return;
}

sub execute_task {
    my ($self) = @_;
    my $task_string = $self->task()->{'command'} . ' ' . $self->task()->{'parameters'};
    my $initial_string = sprintf("Current time is %s\nExecuting task: %s\n", strftime("%Y-%m-%d %H:%M:%S", localtime time), $task_string);
    my $log_fh = $self->log_fh(); # to avoid the error scalar found where operator expected in print
    # just for some odd reason print $self->log_fh won't work
    print $log_fh $initial_string;
    if($self->task->{'username'} eq '') {
        my $who_ran = "Task is executed as the user who ran the server: '" . $self->get_user . "'\n";
        print $log_fh $who_ran;
    } else {
        my $who_ran = "Task is executed as user '" . $self->task()->{'username'} . "'\n";
        print $log_fh $who_ran;
        $task_string = 'runuser -u ' . $self->task()->{'username'} . ' -- ' . $task_string;
    }

    local @ENV{keys %{$self->task()->{'environment_vars'}}} = values %{$self->task()->{'environment_vars'}};

    my $pipe = IO::Pipe->new();
    $task_string .= ' 2>&1'; # redirect STDERR to STDOUT for this pipe
    $pipe->reader($task_string);

    my $running_pid = ${*$pipe}{'io_pipe_pid'};
    $self->persister()->save_process_status(join($PID_FILE_DELIMITER, ($running_pid, $PROCESS_RUNNING_STATE, $self->log_filename())));
    content to_json({ running_task_pid => $running_pid, running_task_status => $PROCESS_RUNNING_STATE }); # let the client know about the onprogress event

    my $pid_info = "Process PID: $running_pid\n";
    print $log_fh $pid_info;

    my $exit_code = -1; # exit code of -1 means unknown status code
    while(waitpid($running_pid, WNOHANG) > -1) {
        while(my $line = <$pipe>) {
            print $log_fh $line;
        }
        $? = 1 if $? == 255;
        $exit_code = $? >> 8;
    }

    my $task_exec_report = "\nTask execution exited with code: $exit_code\n";
    print $log_fh $task_exec_report;

    $self->persister()->save_process_status($NO_RUNNING_PROCESS);
    return $exit_code;
}

sub pause_task {
    my ($self) = @_;
    kill 'STOP', $self->pid();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $self->persister()->get_process_status());
    $pidstat[1] = $PROCESS_PAUSED_STATE;
    $self->persister()->save_process_status(join($PID_FILE_DELIMITER, @pidstat));
}

sub resume_task {
    my ($self) = @_;
    kill 'CONT', $self->pid();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $self->persister()->get_process_status());
    $pidstat[1] = $PROCESS_RUNNING_STATE;
    $self->persister()->save_process_status(join($PID_FILE_DELIMITER, @pidstat));
}

sub stop_task {
    my ($self) = @_;
    kill 'KILL', $self->pid();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $self->persister()->get_process_status());
    $pidstat[1] = $PROCESS_STOPPED_STATE;
    $self->persister()->save_process_status(join($PID_FILE_DELIMITER, @pidstat));
}

sub create_logfile {
    my ($self) = @_;
    my $logfile_path = sprintf("./task_logs/task_%s\_%s", $self->id(), strftime("%Y\_%m\_%d\_%H\_%M\_%S", localtime time));
    make_path($logfile_path);
    my $fh = IO::File->new("$logfile_path/$TASK_LOGFILE_NAME", 'w')
        or die "Cannot open $logfile_path/$TASK_LOGFILE_NAME for writing: $!";
    return ($logfile_path, "$logfile_path/$TASK_LOGFILE_NAME", $fh);
}

sub review_last_task {
    my ($self) = @_;
    my $last_task = $self->persister()->get_last_task();
    my $log = $self->persister()->read_log($last_task->{'log_file'});
    $log = '' if !defined $log;
    return { log => $log, exit_code => $last_task->{'exit_code'} };
}

1;
