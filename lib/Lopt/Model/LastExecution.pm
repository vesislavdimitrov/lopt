package Lopt::Model::LastExecution;

use Dancer2 appname => 'Lopt';
use parent qw(Lopt::Model::Execution);

sub new {
    my ($class, $exit_code, $logfile) = @_;
    my $self = $class->SUPER::new($logfile);
    $self->{exit_code} = $exit_code;
    return $self;
}

1;
