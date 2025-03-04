package Lopt::Service::UserRepository;

use Dancer2 appname => 'Lopt';
use Lopt::Persistence::Persister;
use POSIX qw(getpwnam);

use parent qw(Lopt::Service::Repository);

use constant {
    UUID_IN_USE_ERR => "Cannot create user: UID is already in use.",
    USERNAME_IN_USE_ERR => "Cannot create user: username is already in use.",
    GENERIC_CREATION_ERR => "Cannot create user: an error has occurred and the command exited with code ",
    PASSWORD_CREATION_ERR => "Error when creating user: cannot add a password to the user and the command exited with code ",
    USER_NOT_FOUND_ERR => "Cannot delete user: user not found.",
    NON_LOPT_USER_ERR => "Cannot delete user: user not created by Lopt.",
    DB_DELETION_ERR => "Could not remove user from database.",
    GENERIC_DELETION_ERR => "Cannot delete user: an error has occurred and the command exited with code ",

    USER_ADD_CMD => 'useradd'
};

sub new {
    my ($class, $user, $username) = @_;
    my $self = {
        user => $user,
        persister => Lopt::Persistence::MongoPersister->new(),
        error_message => undef,
        username => $username
    };
    bless $self, $class;
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

sub create {
    my ($self) = @_;
    my @command = (USER_ADD_CMD);
    my ($username, $password) = ($self->user()->{'username'}, $self->user()->{'password'});

    if(length($self->user()->{uid})) {
        if(defined scalar getpwuid($self->user()->{uid})) {
            $self->set_error_message(UUID_IN_USE_ERR);
            return 0;
        }
        push @command, ('-u', $self->user()->{uid});
    }

    if(defined scalar getpwnam($username)) {
        $self->set_error_message(USERNAME_IN_USE_ERR);
        return 0;
    }

    push @command, ('-m', $username);
    die GENERIC_CREATION_ERR . $? >> 8 . '.' if system(@command);

    my $uid = `id -u $username`;
    die GENERIC_CREATION_ERR . $? >> 8 . '.' if $? >> 8;
    chomp($uid);

    `echo '$username:$password' | chpasswd`;
    die PASSWORD_CREATION_ERR . $? >> 8 . '.' if $? >> 8;

    $self->persister()->save_user($username);
    return 1;
}

sub fetch {
    my ($self) = @_;
    my $users = $self->persister()->get_users();

    @$users = map {
        my $uid = getpwnam($_->{username});
        $_->{uid} = defined $uid ? $uid : undef;
        $_;
    } @$users;

    return $users;
}

sub delete {
    my ($self) = @_;
    my $username = $self->username();
    my $persister = $self->persister();

    if(!defined getpwnam($username)) {
        $self->set_error_message(USER_NOT_FOUND_ERR);
        return 0;
    }

    my $all_users = $persister->get_users();
    my $escaped_username = quotemeta($username);
    if(!grep($_->{username} =~ /\A$escaped_username\z/, @{$all_users})) {
        $self->set_error_message(NON_LOPT_USER_ERR);
        return 0;
    }

    if(!$persister->delete_user($username)){
        die DB_DELETION_ERR;
    }

    my @command = ('userdel');
    push @command, ('-r', '-f') if $self->user()->{delete_home};
    push @command, $username;
    system(@command);

    my $exit_code = $? >> 8;
    die GENERIC_DELETION_ERR . $? >> 8 . '.' if $exit_code != 0;

    return 1;
}

1;