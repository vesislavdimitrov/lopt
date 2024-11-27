package Lopt::Controllers::TaskController;

use Dancer2 appname => 'Lopt';
use Lopt::Constants;
use Lopt::Models::TaskModel;
use Lopt::Models::TaskExecutionModel;
use Lopt::Models::Exception;
use Lopt::Service::TaskRepository;
use Lopt::Validation;
use Lopt::Execution::TaskExecution;

prefix '/tasks' => sub {
  post '' => sub {
      debug 'Received ' . request->method . ' to ' . request->path;
      
      my $posted_data = from_json(request->body);
      my $task_model = Lopt::Models::TaskModel->new($posted_data);
      if($task_model->check_validity()) {
        my $valid_credentials = verify_username($task_model->data()->{'username'});
        if(!$valid_credentials) {
          warning request->method . ' failed to ' . request->path;
          status 400;
          return Lopt::Models::Exception->new(400, "Cannot create task: Username '" . $task_model->data()->{'username'} . "' does not exist or cannot be used to run a task in the current state of its account.")->get_hash();
        }
        debug request->method . ' successful to ' . request->path;
        status 201;
        my $repository = Lopt::Service::TaskRepository->new(undef, $task_model->data());
        return $repository->create();
      } else {
          warning request->method . ' failed to ' . request->path;
          status 400;
          return Lopt::Models::Exception->new(400, $task_model->error_message())->get_hash();
      }
  };
  # getting a list of all tasks
  get '' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $repository = Lopt::Service::TaskRepository->new();
    my $tasks = $repository->fetch();
    if(@{$tasks} > 0) {
      return $tasks;
    } else {
      warning request->method . ' failed to ' . request->path;
      status 404;
      return Lopt::Models::Exception->new(404, "No tasks found.")->get_hash();
    }
  };
  
  # task executions

  # get running task pid
  get '/executions' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    return { running_task_pid => $pidstat[0], running_task_status => $pidstat[1] };
  };

  # get running task log so far
  get '/executions/ongoing' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    if($pidstat[0] > $NO_PROCESS_PID && defined $pidstat[2]) {
      delayed {
        flush;
        content to_json({ log => $task_execution->persister()->read_log($pidstat[2]) });
        done;
      };
    } else {
        warning request->method . ' failed to ' . request->path;
        status 404;
        return Lopt::Models::Exception->new(404, "Cannot fetch ongoing task log: there are no tasks currently running.")->get_hash();
    }
  };

  # fetch all the data about the last running task
  get '/executions/last' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my $last_task_exists = $task_execution->persister()->get_last_task();
    if(!defined $last_task_exists) {
        warning request->method . ' failed to ' . request->path;
        status 404;
        return Lopt::Models::Exception->new(404, "Cannot fetch last executed task: its data has been deleted or no tasks have been run yet.")->get_hash();
    }
    delayed {
      flush;
      content to_json($task_execution->review_last_task());
      done;
    };
  };

  # delete the data about the last running task after a review
  del '/executions/last' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my $last_task_exists = $task_execution->persister()->get_last_task();
    if(!defined $last_task_exists) {
        warning request->method . ' failed to ' . request->path;
        status 400;
        return Lopt::Models::Exception->new(400, "Cannot delete the last executed task data: it has already been deleted or no tasks have been run yet.")->get_hash();
    }
    $task_execution->persister()->delete_last_task();
    return status 204;
  };

  # pause the running task
  post '/executions/pause' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    if($pidstat[0] > $NO_PROCESS_PID && $pidstat[1] == $PROCESS_RUNNING_STATE) {
        $task_execution->set_pid($pidstat[0]);
        $task_execution->pause_task();
        return status 204;
    } else {
        warning request->method . ' failed to ' . request->path;
        status 503;
        return Lopt::Models::Exception->new(503, "Cannot pause running task: no task to be paused.")->get_hash();
    }
  };

  # resume the running task
  post '/executions/resume' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    if($pidstat[0] > $NO_PROCESS_PID && $pidstat[1] == $PROCESS_PAUSED_STATE) {
        $task_execution->set_pid($pidstat[0]);
        $task_execution->resume_task();
        return status 204;
    } else {
        warning request->method . ' failed to ' . request->path;
        status 503;
        return Lopt::Models::Exception->new(503, "Cannot resume running task: no task to be resumed.")->get_hash();
    }
  };

  # stop the running task
  post '/executions/stop' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    if($pidstat[0] > $NO_PROCESS_PID) {
        $task_execution->set_pid($pidstat[0]);
        $task_execution->stop_task();
        return status 204;
    } else {
        warning request->method . ' failed to ' . request->path;
        status 503;
        return Lopt::Models::Exception->new(503, "Cannot stop running task: no task to be stopped.")->get_hash();
    }
  };

  # executing a task
  post '/executions/:id' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $task_execution = Lopt::Execution::TaskExecution->new();
    # no need to validate and process anything if there is another process running: just throw an exception
    my @pidstat = split(/$PID_FILE_DELIMITER/, $task_execution->persister()->get_process_status());
    if($pidstat[0] > $NO_PROCESS_PID) {
      warning request->method . ' failed to ' . request->path;
      status 503;
      return Lopt::Models::Exception->new(503, "Cannot execute task: another task is currently in progress.")->get_hash();
    }

    my $last_task = $task_execution->persister()->get_last_task();
    if(defined $last_task) {
      warning request->method . ' failed to ' . request->path;
      status 503;
      return Lopt::Models::Exception->new(503, "Cannot execute task: another task is pending review.")->get_hash();
    }

    my $id = params->{id};
    if(!validate_id($id)) {
      warning request->method . ' failed to ' . request->path;
      status 400;
      return Lopt::Models::Exception->new(400, "Cannot execute task: invalid task ID.")->get_hash();
    }
      
    my $post_data = from_json(request->body);
    my $task_model = Lopt::Models::TaskExecutionModel->new($post_data);
    if($task_model->check_validity()) {
        my $repository = Lopt::Service::TaskRepository->new($id);
        my $task = $repository->fetch();
        if(defined $task) {
          my $valid_credentials = verify_credentials($task->{'username'}, $task_model->data()->{'password'});
          if(!$valid_credentials) {
            warning request->method . ' failed to ' . request->path;
            status 400;
            return Lopt::Models::Exception->new(400, "Cannot execute task: invalid username used when creating the task or an invalid password supplied when executing the task.")->get_hash();
          }
          debug request->method . ' successful to ' . request->path;
          $task_execution->set_id($id);
          $task_execution->set_task($task);
          delayed {
            flush;
            $task_execution->execute();
            done;
          };
        } else {
          warning request->method . ' failed to ' . request->path;
          status 404;
          return Lopt::Models::Exception->new(404, "Cannot execute task: task not found.")->get_hash();
        }
    } else {
        warning request->method . ' failed to ' . request->path;
        status 400;
        return Lopt::Models::Exception->new(400, $task_model->error_message())->get_hash();
    }
  };

  # task-specific handlers

  # getting a specific task
  get '/:id' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $id = params->{id};
    if(!validate_id($id)) {
      warning request->method . ' failed to ' . request->path;
      status 400;
      return Lopt::Models::Exception->new(400, "Cannot fetch task data: invalid task ID.")->get_hash();
    }

    my $repository = Lopt::Service::TaskRepository->new($id);
    my $task = $repository->fetch();
    if(defined $task) {
      return $task;
    } else {
      warning request->method . ' failed to ' . request->path;
      status 404;
      return Lopt::Models::Exception->new(404, "Cannot fetch task data: task not found.")->get_hash();
    }
  };
  # deleting a specific task
  del '/:id' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $id = params->{id};
    if(!validate_id($id)) {
      warning request->method . ' failed to ' . request->path;
      status 400;
      return Lopt::Models::Exception->new(400, "Cannot delete task: invalid task ID.")->get_hash();
    }

    my $repository = Lopt::Service::TaskRepository->new($id);
    my $task = $repository->delete();
    if(defined $task) {
      return status 204;
    } else {
      warning request->method . ' failed to ' . request->path;
      status 404;
      return Lopt::Models::Exception->new(404, "Cannot delete task: task not found.")->get_hash();
    }
  };
  # modifying a specific task
  put '/:id' => sub {
    debug 'Received ' . request->method . ' to ' . request->path;

    my $id = params->{id};
    if(!validate_id($id)) {
      warning request->method . ' failed to ' . request->path;
      status 400;
      return Lopt::Models::Exception->new(400, "Cannot update task: invalid task ID.")->get_hash();
    }
      
    my $put_data = from_json(request->body);
    my $task_model = Lopt::Models::TaskModel->new($put_data);
    if($task_model->check_validity()) {
      my $valid_credentials = verify_username($task_model->data()->{'username'});
      if(!$valid_credentials) {
        warning request->method . ' failed to ' . request->path;
        status 400;
        return Lopt::Models::Exception->new(400, "Cannot update task: Username '" . $task_model->data()->{'username'} . "' does not exist or cannot be used to run a task in the current state of its account.")->get_hash();
      }
      my $repository = Lopt::Service::TaskRepository->new($id, $task_model->data());
      my $task = $repository->update();
      if(defined $task) {
        debug request->method . ' successful to ' . request->path;
        return $task;
      } else {
        warning request->method . ' failed to ' . request->path;
        status 404;
        return Lopt::Models::Exception->new(404, "Cannot update task: task not found.")->get_hash();
      }
    } else {
        warning request->method . ' failed to ' . request->path;
        status 400;
        return Lopt::Models::Exception->new(400, $task_model->error_message())->get_hash();
    }
  };

  # ban methods on /tasks
  any ['put', 'patch', 'delete'] => '' => sub {
    # methods not allowed
    warning 'Received a not allowed method ' . request->method . ' to ' . request->path;
    status 405;
    return Lopt::Models::Exception->new(405, "Method " . request->method . " not allowed on " . request->path)->get_hash();
  };

  # ban methods on /tasks/executions
  any ['post', 'put', 'patch', 'delete'] => '/executions' => sub {
    # methods not allowed
    warning 'Received a not allowed method ' . request->method . ' to ' . request->path;
    status 405;
    return Lopt::Models::Exception->new(405, "Method " . request->method . " not allowed on " . request->path)->get_hash();
  };

  # ban methods on /tasks/executions/**
  any ['put', 'patch', 'delete'] => '/executions/**' => sub {
    # methods not allowed
    warning 'Received a not allowed method ' . request->method . ' to ' . request->path;
    status 405;
    return Lopt::Models::Exception->new(405, "Method " . request->method . " not allowed on " . request->path)->get_hash();
  };
};

1;