package Lopt::Persistence::BasePersister;

use Dancer2 appname => 'Lopt';
use POSIX;
use File::JSON::Slurper qw(read_json write_json);
use File::Slurper qw(read_text write_text);
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

#===BEGIN Abstract
sub save_task {
    ...
}

sub get_tasks {
    ...
}

sub get_task {
    ...
}

sub update_task {
    ...
}

sub delete_task {
    ...
}
#===END Abstract

sub get_process_status {
    my ($self) = @_;
    my $pid = eval { read_text($PID_FILE) };
    return $pid if defined $pid;
    return $NO_RUNNING_PROCESS;
}

sub save_process_status {
    my ($self, $pid) = @_;
    write_text($PID_FILE, $pid);
}

sub get_last_task {
    my ($self) = @_;
    my $json = eval { read_json($LAST_TASK_FILE) };
    return $json;
}

sub save_last_task {
    my ($self, $last_task_data) = @_;
    write_json($LAST_TASK_FILE, $last_task_data);
}

sub delete_last_task {
    my ($self) = @_;
    unlink $LAST_TASK_FILE;
}

sub save_execution {
    my ($self, $log_dir, $execution) = @_;
    write_json("$log_dir/$TASK_EXECUTION_PARAMS_FILE", $execution);
}

sub read_log {
    my ($self, $log_filename) = @_;
    return eval { read_text($log_filename) };
}

sub write_user_home {
    my ($self, $username) = @_;
    my $user_home = File::HomeDir->users_home($username);
    my $user_file = "$user_home/$USER_HOME_FILE";
    if(!-e $user_file) {
        my $user_fh = IO::File->new($user_file, 'w')
            or die "Error when creating user: cannot open $user_file: $!";
        print $user_fh strftime("%Y-%m-%d %H:%M:%S", localtime time);
        $user_fh->close()
            or die "Cannot close $user_file: $!";
        chmod 0444, $user_file;
    }
}

sub get_users {
    my ($self) = @_;
    my $users = [];
    my $shadow_fh = IO::File->new('/etc/shadow', 'r')
        or die "Cannot figure out who the users are using /etc/shadow file: $!";
    while(my $line = <$shadow_fh>) {
        my $username = (split(/:/, $line))[0];
        my $user_home = File::HomeDir->users_home($username);
        next if !defined $user_home;
        my $user_file = "$user_home/$USER_HOME_FILE";
        push @{$users}, { username => $username, uid => scalar getpwnam $username } if -e $user_file;
    }
    return $users;
}

1;