package Lopt::Service::Repository;

use Dancer2 appname => 'Lopt';

sub persister {
    my ($self) = @_;
    return $self->{persister};
}

#===BEGIN Abstract
sub create {
    ...
}

sub fetch {
    ...
}

sub update {
    ...
}

sub delete {
    ...
}
#===END Abstract

1;