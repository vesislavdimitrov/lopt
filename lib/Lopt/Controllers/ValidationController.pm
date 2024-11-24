package Lopt::Controllers::ValidationController;

use Dancer2 appname => 'Lopt';
use Lopt::Validation;

prefix '/validation' => sub {
    # validation handlers
    # validating uids for user actions
    get '/users/uid/:uid' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;

        my $uid = params->{uid};
        if(!validate_id($uid)) {
            status 400;
            return Lopt::Models::Exception->new(400, "Invalid UID.")->get_hash();
        }
        if(defined scalar getpwuid($uid)) {
            status 400;
            return Lopt::Models::Exception->new(400, "UID is already in use.")->get_hash();
        }
        return status 204;
    };

    # validating usernames for user actions
    prefix '/users/username' => sub {
        get '/:username' => sub {
            debug 'Received ' . request->method . ' to ' . request->path;

            my $username = params->{username};
            my $repository = Lopt::Service::UserRepository->new();
            my $users = $repository->fetch();
            my $escaped_username = quotemeta($username);
            my $username_exists = defined getpwnam($username);
            my $username_used = grep($_->{username} =~ /\A$escaped_username\z/, @{$users});

            if($username_exists && !$username_used) {
                status 400;
                return Lopt::Models::Exception->new(400, "User '$username' has not been created by Lopt.")->get_hash();
            }
            if(!$username_exists) {
                status 400;
                return Lopt::Models::Exception->new(400, "User '$username' does not exist.")->get_hash();
            }

            return status 204;
        };

        get '/:username/nonexistent' => sub {
            debug 'Received ' . request->method . ' to ' . request->path;

            my $username = params->{username};
            if(defined getpwnam($username)) {
                status 400;
                return Lopt::Models::Exception->new(400, "User '$username' already exists.")->get_hash();
            }

            return status 204;
        };
    };

    # validating usernames for task actions
    get '/tasks/username/:username' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;

        my $username = params->{username};
        if(!verify_username($username)) {
            status 400;
            return Lopt::Models::Exception->new(400, "Username '$username' does not exist or cannot be used to run a task in the current state of its account.")->get_hash();
        }
        return status 204;
    };

    # validating ids for task actions
    get '/tasks/id/:id' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;

        my $id = params->{id};
        if(!validate_id($id)) {
            status 400;
            return Lopt::Models::Exception->new(400, "Invalid ID.")->get_hash();
        }

        my $repository = Lopt::Service::TaskRepository->new($id);
        my $task = $repository->fetch();
        if(!defined $task) {
            status 400;
            return Lopt::Models::Exception->new(400, "No task found with ID $id.")->get_hash();
        }

        return status 204;
    };

    # ban methods on /validation
    any ['post', 'put', 'patch', 'delete'] => '' => sub {
        # methods not allowed
        warning 'Received a not allowed method ' . request->method . ' to ' . request->path;
        status 405;
        return Lopt::Models::Exception->new(405, "Method " . request->method . " not allowed on " . request->path)->get_hash();
    };
};

1;