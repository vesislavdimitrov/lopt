package Lopt::Controllers::TaskController;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use Lopt::Constants;
use Lopt::Model::Task;
use Lopt::Model::ExecutionRequest;
use Lopt::Model::Exception;
use Lopt::Service::TaskRepository;
use Lopt::Validation;
use Lopt::Execution::TaskExecution;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_success_message
    get_warning_message
    get_banned_method_message
    get_auth_error
    authorize
);

prefix '/tasks' => sub {
    post '' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $task_model = Lopt::Model::Task->new(from_json(request->body()));
        if(!$task_model->check_validity()) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, $task_model->error_message())->get_hash();
        }

        my $valid_credentials = verify_username($task_model->data()->{'username'});
        if(!$valid_credentials) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(
                400,
                "Cannot create task: Username '"
                . $task_model->data()->{'username'}
                ."' does not exist or cannot be used to run a task in the current state of its account."
            )->get_hash();
        }

        debug(get_success_message(request));
        status 201;
        my $repository = Lopt::Service::TaskRepository->new(undef, $task_model->data());
        return $repository->create();
    };

    get '' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $tasks = Lopt::Service::TaskRepository->new()->fetch();
        return $tasks if @{$tasks} > 0;

        warning(get_warning_message(request));
        status 404;
        return Lopt::Model::Exception->new(404, "No tasks found.")->get_hash();
    };

    prefix '/executions' => sub {
        get '' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());
            return { running_task_pid => $pidstat[0], running_task_status => $pidstat[1] };
        };

        get '/ongoing' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());

            if ($pidstat[0] <= $NO_PROCESS_PID || !defined $pidstat[2]) {
                warning(get_warning_message(request));
                status 404;
                return Lopt::Model::Exception->new(
                    404,
                    "Cannot fetch ongoing task log: there are no tasks currently running."
                )->get_hash();
            }
            delayed {
                flush;
                content to_json({ log => $task_execution->persister()->read_log($pidstat[2]) });
                done;
            };
        };

        get '/last' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my $last_task_exists = $task_execution->persister()->get_last_executed_task();
            if(!defined $last_task_exists) {
                warning(get_warning_message(request));
                status 404;
                return Lopt::Model::Exception->new(
                    404,
                    "Cannot fetch last executed task: its data has been deleted or no tasks have been run yet."
                )->get_hash();
            }
            delayed {
                flush;
                content to_json($task_execution->review_last_task());
                done;
            };
        };

        del '/last' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my $last_task_exists = $task_execution->persister()->get_last_executed_task();
            if(!defined $last_task_exists) {
                warning(get_warning_message(request));
                status 400;
                return Lopt::Model::Exception->new(
                    400,
                    "Cannot delete the last executed task data: it has already been deleted or no tasks have been run yet."
                )->get_hash();
            }

            $task_execution->persister()->delete_last_executed_task();
            return status 204;
        };

        post '/pause' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());
            if($pidstat[0] > $NO_PROCESS_PID && $pidstat[1] == $PROCESS_RUNNING_STATE) {
                $task_execution->set_pid($pidstat[0]);
                $task_execution->pause_task();
                return status 204;
            }

            warning(get_warning_message(request));
            status 503;
            return Lopt::Model::Exception->new(
                503,
                "Cannot pause running task: no task to be paused."
            )->get_hash();
        };

        post '/resume' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());
            if($pidstat[0] > $NO_PROCESS_PID && $pidstat[1] == $PROCESS_PAUSED_STATE) {
                $task_execution->set_pid($pidstat[0]);
                $task_execution->resume_task();
                return status 204;
            }
            warning(get_warning_message(request));
            status 503;
            return Lopt::Model::Exception->new(
                503, "Cannot resume running task: no task to be resumed."
            )->get_hash();
        };

        post '/stop' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());
            if($pidstat[0] > $NO_PROCESS_PID) {
                $task_execution->set_pid($pidstat[0]);
                $task_execution->stop_task();
                return status 204;
            }
            warning(get_warning_message(request));
            status 503;
            return Lopt::Model::Exception->new(
                503,
                "Cannot stop running task: no task to be stopped."
            )->get_hash();
        };

        post '/:id' => sub {
            debug(get_debug_message(request));
            return get_auth_error(request) if !authorize(request);

            my $task_execution = Lopt::Execution::TaskExecution->new();
            my @pidstat = split(/$TASK_DATA_DELIMITER/, $task_execution->persister()->get_process_status());
            if($pidstat[0] > $NO_PROCESS_PID) {
                warning(get_warning_message(request));
                status 503;
                return Lopt::Model::Exception->new(
                    503,
                    "Cannot execute task: another task is currently in progress."
                )->get_hash();
            }

            my $last_task = $task_execution->persister()->get_last_executed_task();
            if(defined $last_task) {
                warning(get_warning_message(request));
                status 503;
                return Lopt::Model::Exception->new(
                    503,
                    "Cannot execute task: another task is pending review."
                )->get_hash();
            }

            my $id = params->{id};
            if(!validate_id($id)) {
                warning(get_warning_message(request));
                status 400;
                return Lopt::Model::Exception->new(
                    400,
                    "Cannot execute task: invalid task ID."
                )->get_hash();
            }

            my $post_data = from_json(request->body);
            my $request_model = Lopt::Model::ExecutionRequest->new($post_data);
            if(!$request_model->check_validity()) {
                warning(get_warning_message(request));
                status 400;
                return Lopt::Model::Exception->new(400, $request_model->error_message())->get_hash();
            }

            my $repository = Lopt::Service::TaskRepository->new($id);
            my $task = $repository->fetch();
            if(!defined $task) {
                warning(get_warning_message(request));
                status 404;
                return Lopt::Model::Exception->new(
                    404,
                    "Cannot execute task: task not found."
                )->get_hash();
            }

            my $valid_credentials = verify_credentials($task->{'username'}, $request_model->data()->{'password'});
            if(!$valid_credentials) {
                warning(get_warning_message(request));
                status 400;
                return Lopt::Model::Exception->new(
                    400,
                    "Cannot execute task: invalid username used when creating the task or an invalid password supplied when executing the task."
                )->get_hash();
            }

            debug(get_success_message(request));
            $task_execution->set_id($id);
            $task_execution->set_task($task);
            delayed {
                flush;
                $task_execution->execute();
                done;
            };
        };
    };

    get '/:id' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $id = params->{id};
        if(!validate_id($id)) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(
                400,
                "Cannot fetch task data: invalid task ID."
            )->get_hash();
        }

        my $repository = Lopt::Service::TaskRepository->new($id);
        my $task = $repository->fetch();
        if(!defined $task) {
            warning(get_warning_message(request));
            status 404;
            return Lopt::Model::Exception->new(
                404,
                "Cannot fetch task data: task not found."
            )->get_hash();
        }
        return $task;
    };

    del '/:id' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $id = params->{id};
        if(!validate_id($id)) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(
                400,
                "Cannot delete task: invalid task ID."
            )->get_hash();
        }

        my $repository = Lopt::Service::TaskRepository->new($id);
        my $task = $repository->delete();
        if (!defined $task) {
            warning(get_warning_message(request));
            status 404;
            return Lopt::Model::Exception->new(
                404,
                "Cannot delete task: task not found."
            )->get_hash();
        }
        return status 204
    };

    put '/:id' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        my $id = params->{id};
        if(!validate_id($id)) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(
                400,
                "Cannot update task: invalid task ID."
            )->get_hash();
        }
          
        my $put_data = from_json(request->body);
        my $task_model = Lopt::Model::Task->new($put_data);

        if (!$task_model->check_validity()) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, $task_model->error_message())->get_hash();
        }

        my $valid_credentials = verify_username($task_model->data()->{'username'});
        if (!$valid_credentials) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(
                400,
                "Cannot update task: Username '" . $task_model->data()->{'username'} . "' does not exist or cannot be used to run a task in the current state of its account."
            )->get_hash();
        }

        my $repository = Lopt::Service::TaskRepository->new($id, $task_model->data());
        my $task = $repository->update();
        if (!defined $task) {
            warning(get_warning_message(request));
            status 404;
            return Lopt::Model::Exception->new(404, "Cannot update task: task not found.")->get_hash();
        }
        debug(get_debug_message(request));
        return $task;
    };

    # ban methods on /tasks
    any ['put', 'patch', 'delete'] => '' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };

    # ban methods on /tasks/executions
    any ['post', 'put', 'patch', 'delete'] => '/executions' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };

    # ban methods on /tasks/executions/**
    any ['put', 'patch', 'delete'] => '/executions/**' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };
};

1;