package Lopt::Controllers::ValidationController;

use Dancer2 appname => 'Lopt';
use Lopt::Validation;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_warning_message
    get_banned_method_message
);

use constant {
    INVALID_UID => "Invalid UID.",
    UID_ALREADY_IN_USE => "UID is already in use.",
    USER_NOT_CREATED_BY_LOPT => "User '%s' has not been created by Lopt.",
    USER_DOES_NOT_EXIST => "User '%s' does not exist.",
    USER_ALREADY_EXISTS => "User '%s' already exists.",
    INVALID_USERNAME_TASK_ERROR => "Username '%s' does not exist or cannot be used to run a task in the current state of its account.",
    INVALID_ID => "Invalid ID.",
    NO_TASK_FOUND => "No task found with ID %s.",
};

prefix '/validation' => sub {
    get '/users/uid/:uid' => sub {
        debug(get_debug_message(request));

        my $uid = params->{uid};
        if(!validate_id($uid)) {
            status 400;
            return Lopt::Model::Exception->new(400, INVALID_UID)->get_hash();
        }
        if(defined scalar getpwuid($uid)) {
            status 400;
            return Lopt::Model::Exception->new(400, UID_ALREADY_IN_USE)->get_hash();
        }
        return status 204;
    };

    prefix '/users/username' => sub {
        get '/:username' => sub {
            debug(get_debug_message(request));

            my $username = params->{username};
            my $users = Lopt::Service::UserRepository->new()->fetch();
            my $escaped_username = quotemeta($username);
            my $username_exists = defined getpwnam($username);
            my $username_used = grep($_->{username} =~ /\A$escaped_username\z/, @{$users});

            if($username_exists && !$username_used) {
                status 400;
                return Lopt::Model::Exception->new(400, sprintf(USER_NOT_CREATED_BY_LOPT, $username))->get_hash();
            }
            if(!$username_exists) {
                status 400;
                return Lopt::Model::Exception->new(400, sprintf(USER_DOES_NOT_EXIST, $username))->get_hash();
            }
            return status 204;
        };

        get '/:username/new' => sub {
            debug(get_debug_message(request));

            my $username = params->{username};
            if(defined getpwnam($username)) {
                status 400;
                return Lopt::Model::Exception->new(400, sprintf(USER_ALREADY_EXISTS, $username))->get_hash();
            }
            return status 204;
        };
    };

    get '/tasks/username/:username' => sub {
        debug(get_debug_message(request));

        my $username = params->{username};
        if(!verify_username($username)) {
            status 400;
            return Lopt::Model::Exception->new(400, sprintf(INVALID_USERNAME_TASK_ERROR, $username))->get_hash();
        }
        return status 204;
    };

    get '/tasks/id/:id' => sub {
        debug(get_debug_message(request));

        my $id = params->{id};
        if(!validate_id($id)) {
            status 400;
            return Lopt::Model::Exception->new(400, INVALID_ID)->get_hash();
        }

        my $repository = Lopt::Service::TaskRepository->new($id);
        my $task = $repository->fetch();
        if(!defined $task) {
            status 400;
            return Lopt::Model::Exception->new(400, sprintf(NO_TASK_FOUND, $id))->get_hash();
        }
        return status 204;
    };

    # ban methods on /validation
    any ['post', 'put', 'patch', 'delete'] => '' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };
};

1;
