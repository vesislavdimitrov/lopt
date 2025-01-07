package Lopt::Service::UserRepository;

use Dancer2 appname => 'Lopt';
use Lopt::Persistence::Persister;

use parent qw(Lopt::Service::CrudRepository);

sub new {
    my ($class, $user, $username) = @_;
    my $self = {
        user => $user,
        persister => Lopt::Persistence::Persister->new(),
        error_message => undef,
        username => $username
    };
    bless $self, $class;
}

sub create {
    my ($self) = @_;
    my @command = ('useradd');

    my ($username, $password) = ($self->user()->{'username'}, $self->user()->{'password'});
    if(length($self->user()->{'uid'})) {
        if(defined scalar getpwuid($self->user()->{'uid'})) {
            $self->set_error_message("Cannot create user: UID is already in use.");
            return 0;
        }
        push @command, ('-u', $self->user()->{'uid'});
    }

    if(defined scalar getpwnam($username)) {
        $self->set_error_message("Cannot create user: username is already in use.");
        return 0;
    }

    push @command, ('-m', $username);
    die "Cannot create user: an error has occurred and the command exited with code " . $? >> 8 . '.' if system(@command);

    my $uid = `id -u $username`;
    die "Cannot create user: the system was unable to create the user and the command exited with code " . $? >> 8 . '.' if $? >> 8;
    chomp($uid);

    `echo '$username:$password' | chpasswd`; # run command to add password to the user
    # in backticks or system won't execute it properly
    die "Error when creating user: cannot add a password to the user and the command exited with code " . $? >> 8 . '.' if $? >> 8;

    $self->persister()->write_user_home($username);
    
    return 1;
}

sub fetch {
    my ($self) = @_; #TODO, error message here not in the controller.
    return $self->persister()->get_users();
}

sub delete {
    my ($self) = @_;
    my $username = $self->username();
    if(!defined getpwnam($username)) {
        $self->set_error_message("Cannot delete user: user not found.");
        return 0;
    }
    my $all_users = $self->persister()->get_users();
    my $escaped_username = quotemeta($username);
    if(!grep($_->{username} =~ /\A$escaped_username\z/, @{$all_users})) {
        $self->set_error_message("Cannot delete user: user not created by Lopt.");
        return 0;
    }
    my @command = ('userdel');
    push @command, ('-r', '-f') if $self->user()->{'delete_home'};
    push @command, $username;
    system(@command);
    my $exit_code = $? >> 8;
    return 1 if $exit_code == 0;
    die "Cannot delete user: an error has occurred and the command exited with code " . $? >> 8 . '.';
}

sub user {
    my ($self) = @_;
    return $self->{user};
}

sub error_message {
    my ($self) = @_;
    return $self->{error_message};
}

sub set_error_message {
    my ($self, $error) = @_;
    return $self->{error_message} = $error;
}

sub username {
    my ($self) = @_;
    return $self->{username};
}

1;