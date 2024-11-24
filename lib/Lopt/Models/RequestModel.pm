package Lopt::Models::RequestModel;

use Dancer2 appname => 'Lopt';
use Lopt::Constants;

sub new {
    my ($class, $data) = @_;
    die "Error when initializing $class: the request was not a JSON" if !ref $data;
    my $self = {
        data => $data
    };
    bless $self, $class;
}

sub validate {
    my ($self, $data, $model) = @_;
    if(defined $model->{$REQUEST_MODEL_NOT_ACTUAL_KEYS} && $model->{$REQUEST_MODEL_NOT_ACTUAL_KEYS} == 1) {
        return $self->validate_abstract_keys($data, $model);
    }
    return $self->validate_keys($data, $model);
}

sub validate_keys {
    my ($self, $data, $model) = @_;
    my $class = ref $self;
    foreach my $key (keys %{$model}) {
        if(!exists $data->{$key}) {
            # check if the required keys based on the model exist
            error "required model key '$key' not existent when attempting to parse hash when creating a $class instance";
            $self->set_error_message("Error when initializing $class: required model key '$key' does not exist in the request JSON.");
            return 0;
        }
        if(ref $data->{$key} eq ref {}) {
            if(ref $model->{$key} ne ref {}) {
                error "value of key '$key' should be a scalar when attempting to parse hash when creating a $class instance";
                $self->set_error_message("Error when initializing a task: value of '$key' should be a scalar in the request JSON that has to be parsed.");
                return 0;
            }
            # validate the nested hash(es) key-value pairs
            my $validation = $self->validate($data->{$key}, $model->{$key});
            return $validation if !$validation;
        } else {
            # it's not a hash, validate just the value
            my $regex = $model->{$key};
            if(ref $regex eq ref {}) {
                error "value of key '$key' should be a hash when attempting to parse hash when creating a $class instance";
                $self->set_error_message("Error when initializing a task: value of '$key' should be a hash in the request JSON that has to be parsed.");
                return 0;
            } elsif($data->{$key} !~ /$regex/) {
                error "value of required model key '$key' does not match the required regex $regex when attempting to parse hash when creating a $class instance";
                $self->set_error_message("Error when initializing $class: value of required model key '$key' does not match the required regex $regex in the request JSON that has to be parsed.");
                return 0;
            }
        }
    }

    return 1;
}

sub validate_abstract_keys {
    my ($self, $data, $model)= @_;
    my $class = ref $self;
    foreach my $nested_key (keys %{$data}) {
        next if $nested_key eq $REQUEST_MODEL_NOT_ACTUAL_KEYS;
        my $key_regex = $model->{'key'};
        my $value_regex = $model->{'value'};
        if($nested_key !~ /$key_regex/) {
            error "key '$nested_key' does not match the required regex $key_regex when attempting to parse hash when creating a $class instance";
            $self->set_error_message("Error when initializing a task: key '$nested_key' does not match the required regex $key_regex in the request JSON that has to be parsed.");
            return 0;
        }
        if(ref $model->{'value'} eq ref {}) {
            if(!ref $data->{$nested_key}) {
                error "value of key '$nested_key' should be a hash when attempting to parse hash when creating a $class instance";
                $self->set_error_message("Error when initializing a task: value of '$nested_key' should be a hash in the request JSON that has to be parsed.");
                return 0;
            }
            my $validation = $self->validate($data->{$nested_key}, $model->{'value'});
            return $validation if !$validation;
        } elsif(ref $data->{$nested_key}) {
            error "value of key '$nested_key' should be a scalar when attempting to parse hash when creating a $class instance";
            $self->set_error_message("Error when initializing a task: value of '$nested_key' should be a scalar in the request JSON that has to be parsed.");
            return 0;
        } elsif($data->{$nested_key} !~ /$value_regex/) {
            error "value of key '$nested_key' does not match the required regex $value_regex when attempting to parse hash when creating a $class instance";
            $self->set_error_message("Error when initializing a task: value of '$nested_key' does not match the required regex $value_regex in the request JSON that has to be parsed.");
            return 0;
        }
    }
    return 1;
}

sub data {
    my ($self) = @_;
    return $self->{data};
}

sub error_message {
    my ($self) = @_;
    return $self->{error_message};
}

sub set_error_message {
    my ($self, $error) = @_;
    return $self->{error_message} = $error;
}

1;