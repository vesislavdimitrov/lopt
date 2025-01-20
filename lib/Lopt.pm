package Lopt;

use Dancer2;
use Lopt::Constants;
use Lopt::Controllers::HomeController;
use Lopt::Controllers::TaskController;
use Lopt::Controllers::UserController;
use Lopt::Controllers::UploadController;
use Lopt::Execution::TaskExecution;
use Cwd;

our $VERSION = '1.0';
$ENV{'WORKSPACE'} = getcwd() . $WORKSPACE_DIR;

my $task_execution = Lopt::Execution::TaskExecution->new();
$task_execution->persister()->save_process_status($NO_RUNNING_PROCESS); 
# reset the running task pid file in case another task has been killed forcefully previously
# and the program couldn't clean up

1;
