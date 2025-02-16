package Lopt::Model::Execution;

use Dancer2 appname => 'Lopt';

sub new {
    my ($class, $logfile) = @_;
    my $self = {
        logfile => $logfile
    };
    bless $self, $class;
    return $self;
}

1;
