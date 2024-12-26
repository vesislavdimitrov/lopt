package Lopt::Model::Request;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use Lopt::Constants;

use constant {
    MISSING_JSON_ERR_MSG => 'Error when initializing %s: the request is missing JSON formatted string',
    FORMAT_ERROR_MSG => 'Error when initializing %s: value of \'%s\' is not formatted correctly.',
    MISSING_KEY_ERROR_MSG => 'Error when initializing %s: required value key \'%s\' is missing.',

    LOG_REQUIRED_KEY_NOT_EXIST_ERR_MSG => "required model key '%s' not existent when creating a %s instance",
    LOG_INVALID_HASH_ERR_MSG => "value of key '%s' should be a hash when creating a %s instance",
    LOG_INVALID_KEY_VALUE_ERR_MSG => "value of required model key '%s' does not match the required regex %s when creating a %s instance",
    LOG_INVALID_ABSTRACT_KEY_ERR_MSG => "key '%s' does not match the required regex %s when creating a %s instance",
    LOG_INVALID_ABSTRACT_VALUE_ERR_MSG => "value of key '%s' should be a scalar when creating a %s instance",
};

sub new {
    my ($class, $data) = @_;
    die sprintf(MISSING_JSON_ERR_MSG, $class) if !ref $data;
    my $self = {
        data => $data
    };
    bless $self, $class;
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

    foreach my $key (keys %$data) { #prune extra data
        delete $data->{$key} if not exists $model->{$key};
    }

    foreach my $key (keys %{$model}) {
        return 0 unless $self->_validate_key_existence($data, $model, $key, $class);
        return 0 unless $self->_validate_key_value($data, $model, $key, $class);
    }
    return 1;
}

sub validate_abstract_keys {
    my ($self, $data, $model) = @_;
    my $class = ref $self;

    foreach my $nested_key (keys %{$data}) {
        next if $nested_key eq $REQUEST_MODEL_NOT_ACTUAL_KEYS;
        return 0 unless $self->_validate_abstract_key($data, $model, $nested_key, $class);
    }
    return 1;
}

sub _validate_key_existence {
    my ($self, $data, $model, $key, $class) = @_;

    unless (exists $data->{$key}) {
        error sprintf(LOG_REQUIRED_KEY_NOT_EXIST_ERR_MSG, $key, $class);
        $self->set_error_message(sprintf(MISSING_KEY_ERROR_MSG, $class, $key));
        return 0;
    }
    return 1;
}

sub _validate_key_value {
    my ($self, $data, $model, $key, $class) = @_;

    if (ref $data->{$key} eq ref {}) {
        return $self->_validate_nested_hash($data, $model, $key, $class);
    }
    return $self->_validate_scalar_value($data, $model, $key, $class);
}

sub _validate_nested_hash {
    my ($self, $data, $model, $key, $class) = @_;

    unless (ref $model->{$key} eq ref {}) {
        error sprintf(LOG_INVALID_HASH_ERR_MSG, $key, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $key));
        return 0;
    }

    my $validation = $self->validate($data->{$key}, $model->{$key});
    return $validation if !$validation;
    return 1;
}

sub _validate_scalar_value {
    my ($self, $data, $model, $key, $class) = @_;
    my $regex = $model->{$key};

    if (ref $regex eq ref {}) {
        error sprintf(LOG_INVALID_HASH_ERR_MSG, $key, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $key));
        return 0;
    }
    if ($data->{$key} !~ /$regex/) {
        error sprintf(LOG_INVALID_KEY_VALUE_ERR_MSG, $key, $regex, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $key));
        return 0;
    }
    return 1;
}

sub _validate_abstract_key {
    my ($self, $data, $model, $nested_key, $class) = @_;

    my $key_regex = $model->{'key'};
    my $value_regex = $model->{'value'};

    unless ($nested_key =~ /$key_regex/) {
        error sprintf(LOG_INVALID_ABSTRACT_KEY_ERR_MSG, $nested_key, $key_regex, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $nested_key));
        return 0;
    }

    if (ref $model->{'value'} eq ref {}) {
        return $self->_validate_abstract_nested_hash($data, $model, $nested_key, $class);
    }
    if (ref $data->{$nested_key}) {
        error sprintf(LOG_INVALID_ABSTRACT_VALUE_ERR_MSG, $nested_key, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $nested_key));
        return 0;
    }
    if ($data->{$nested_key} !~ /$value_regex/) {
        error sprintf(LOG_INVALID_ABSTRACT_VALUE_ERR_MSG, $nested_key, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $nested_key));
        return 0;
    }
    return 1;
}

sub _validate_abstract_nested_hash {
    my ($self, $data, $model, $nested_key, $class) = @_;

    unless (ref $data->{$nested_key}) {
        error sprintf(LOG_INVALID_HASH_ERR_MSG, $nested_key, $class);
        $self->set_error_message(sprintf(FORMAT_ERROR_MSG, $class, $nested_key));
        return 0;
    }

    my $validation = $self->validate($data->{$nested_key}, $model->{'value'});
    return $validation if !$validation;
    return 1;
}

1;
