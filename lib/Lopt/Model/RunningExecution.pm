package Lopt::Model::RunningExecution;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Model::Execution);

sub new {
    my ($class, $pid, $status, $logfile) = @_;
    my $self = $class->SUPER::new($logfile);
    $self->{pid} = $pid;
    $self->{status} = $status;
    return $self;
}

1;
