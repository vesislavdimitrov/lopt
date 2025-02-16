package Lopt;

use Dancer2;
use File::Spec;
use Cwd;

use Lopt::Constants qw($NO_RUNNING_PROCESS $WORKSPACE_DIR);
use Lopt::Controllers::HomeController;
use Lopt::Controllers::TaskController;
use Lopt::Controllers::UserController;
use Lopt::Controllers::UploadController;
use Lopt::Controllers::AnalysisController;
use Lopt::Execution::TaskExecution;

our $VERSION = '1.0';

$ENV{'WORKSPACE'} = File::Spec->catfile(getcwd(), $WORKSPACE_DIR);

# ensure clean boot
my $executionPersister = Lopt::Execution::TaskExecution->new()->persister();
$executionPersister->save_process_status($NO_RUNNING_PROCESS);
$executionPersister->delete_last_executed_task();

1;
