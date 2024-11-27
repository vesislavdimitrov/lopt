package Lopt::Controllers::UserController;

use Dancer2 appname => 'Lopt';
use Lopt::Models::UserModel;
use Lopt::Models::UserDeletionModel;
use Lopt::Models::Exception;
use Lopt::Service::UserRepository;
use Lopt::Validation;

prefix '/users' => sub {
    post '' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;
      
        my $posted_data = from_json(request->body);
        my $user_model = Lopt::Models::UserModel->new($posted_data);
        if($user_model->check_validity()) {
            debug request->method . ' successful to ' . request->path;
            my $repository = Lopt::Service::UserRepository->new($user_model->data());
            if($repository->create()) {
                status 201;
                return;
            }
            warning request->method . ' failed to ' . request->path;
            status 400;
            return Lopt::Models::Exception->new(400, $repository->error_message())->get_hash();
        } else {
            warning request->method . ' failed to ' . request->path;
            status 400;
            return Lopt::Models::Exception->new(400, $user_model->error_message())->get_hash();
        }
    };

    # getting list of all users, created by Lopt
    get '' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;

        my $repository = Lopt::Service::UserRepository->new();
        my $users = $repository->fetch();
        if(@{$users} > 0) {
            return $users;
        } else {
            warning request->method . ' failed to ' . request->path;
            status 404;
            return Lopt::Models::Exception->new(404, "No users created by Lopt found.")->get_hash();
        }
    };

    # deleting a user, created by Lopt
    del '/:username' => sub {
        debug 'Received ' . request->method . ' to ' . request->path;

        my $username = params->{username};
        my $posted_data = from_json(request->body);
        my $user_model = Lopt::Models::UserDeletionModel->new($posted_data);
        if($user_model->check_validity()) {
            debug request->method . ' successful to ' . request->path;
            my $repository = Lopt::Service::UserRepository->new($user_model->data(), $username);
            return status 204 if $repository->delete();
            warning request->method . ' failed to ' . request->path;
            status 400;
            return Lopt::Models::Exception->new(400, $repository->error_message())->get_hash();
        } else {
            warning request->method . ' failed to ' . request->path;
            status 400;
            return Lopt::Models::Exception->new(400, $user_model->error_message())->get_hash();
        }
    };

    # ban methods on /users
    any ['put', 'patch', 'delete'] => '' => sub {
        # methods not allowed
        warning 'Received a not allowed method ' . request->method . ' to ' . request->path;
        status 405;
        return Lopt::Models::Exception->new(405, "Method " . request->method . " not allowed on " . request->path)->get_hash();
    };
};

1;