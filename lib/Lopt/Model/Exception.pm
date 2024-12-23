package Lopt::Model::Exception;

use Dancer2 appname => 'Lopt';
use Dancer2::Core::HTTP qw();

sub new {
    my ($class, $status, $message) = @_;
    if($status =~ /\A\d+\z/) {
        my $self = {
            data => {
                status => $status,
                title => "Error $status: " . Dancer2::Core::HTTP->status_message($status),
                message => $message
            }
        };
        bless $self, $class;
    } else {
        error "Invalid HTTP status code passed when generating an Exception";
        return undef;
    }
}

sub get_hash {
    my ($self) = @_;
    return $self->{data};
}

sub http_status {
    my ($self) = @_;
    return $self->{data}->{status};
}

sub title {
    my ($self) = @_;
    return $self->{data}->{title};
}

sub message {
    my ($self) = @_;
    return $self->{data}->{message};
}

1;