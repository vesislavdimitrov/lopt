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

sub save_execution {
    my ($self, $log_dir, $execution) = @_;
    write_json("$log_dir/$TASK_EXECUTION_PARAMS_FILE", $execution);
    return 1;
}

sub read_log {
    my ($self, $log_filename) = @_;
    return eval { read_text($log_filename) };
}

sub write_user_home {
    my ($self, $username) = @_;
    my $user_home = File::HomeDir->users_home($username);
    my $user_file = "$user_home/$USER_HOME_FILE";
    return if -e $user_file;

    my $user_fh = IO::File->new($user_file, 'w')
        or die "Error when creating user: cannot open $user_file: $!";
    print $user_fh strftime("%Y-%m-%d %H:%M:%S", localtime time);
    $user_fh->close()
        or die "Cannot close $user_file: $!";
    chmod 0444, $user_file;
    return 1;
}

sub get_users {
    my ($self) = @_;
    my $users = [];
    my $shadow_fh = IO::File->new($SHADOW_PATH, 'r')
        or die "Canot find users in $SHADOW_PATH: $!";
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