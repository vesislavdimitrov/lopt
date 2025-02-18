package Lopt::Controllers::UserController;

use Dancer2 appname => 'Lopt';
use POSIX qw(getpwuid);
use Lopt::Model::User;
use Lopt::Model::UserDeletion;
use Lopt::Model::Exception;
use Lopt::Service::UserRepository;
use Lopt::Validation;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_success_message
    get_warning_message
    get_banned_method_message
    get_unsecure_request_message
    get_auth_error
    authorize
    encode
);

use constant {
    NO_USERS_BY_APP_ERR => "No users created by Lopt found.",
    MISSING_CREDENTIALS_ERR => "Missing credentials",
    INVALID_CREDENTIALS_ERR => "Invalid superuser credentials"
};

prefix '/users' => sub {
    post '' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $user_model = Lopt::Model::User->new(from_json(request->body));
        if(!$user_model->check_validity()) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, $user_model->error_message())->get_hash();
        }

        debug(get_success_message(request));
        my $repository = Lopt::Service::UserRepository->new($user_model->data());
        if(!$repository->create()) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, $repository->error_message())->get_hash();
        }

        status 201;
        return $user_model->data();
    };

    get '' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $users = Lopt::Service::UserRepository->new()->fetch();
        return $users if @{$users} > 0;

        warning(get_warning_message(request));
        status 404;
        return Lopt::Model::Exception->new(404, NO_USERS_BY_APP_ERR)->get_hash();
    };

    del '/:username' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $username = params->{username};
        my $posted_data = from_json(request->body);
        my $user_model = Lopt::Model::UserDeletion->new($posted_data);
        if(!$user_model->check_validity()) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, $user_model->error_message())->get_hash();
        }

        debug(get_success_message(request));
        my $repository = Lopt::Service::UserRepository->new($user_model->data(), $username);
        return status 204 if $repository->delete();

        warning(get_warning_message(request));
        status 400;
        return Lopt::Model::Exception->new(400, $repository->error_message())->get_hash();
    };

    post '/login' => sub {
        debug(get_debug_message(request));

        my $password = from_json(request->body)->{password} // '';
        if (!$password) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, MISSING_CREDENTIALS_ERR)->get_hash();
        }

        my $user = getpwuid($<);
        my $token = encode("$user:$password");
        if (!authenticate_user($token)) {
            warning(get_warning_message(request));
            status 401;
            return Lopt::Model::Exception->new(401, INVALID_CREDENTIALS_ERR)->get_hash();
        }

        status 200;
        debug(get_success_message(request));
        return { token => $token };
    };

    # ban methods on /users
    any ['put', 'patch', 'delete'] => '' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };
};

1;