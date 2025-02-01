package Lopt::Controllers::AnalysisController;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use File::Basename;
use Lopt::Model::Exception;
use Lopt::Execution::Llama;
use Lopt::Constants;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_warning_message
    get_banned_method_message
    get_success_message
);

use constant {
    NO_LOG_ERROR => 'No log provided for analysis.',
    MISSING_ENV_ERROR => 'Missing AI Assistant environment.',
    GENERIC_ERROR => 'Soemthing went wrong. Could not analyze log.'
};

prefix '/analysis' => sub {
    post '' => sub {
        debug(get_debug_message(request));

        my $log = body_parameters->get('log');
        if (!$log) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, NO_LOG_ERROR)->get_hash();
        }

        my $llama = Lopt::Execution::Llama->new();
        if (!$llama->has_needed_environment()) {
            warning(get_warning_message(request));
            status 404;
            return Lopt::Model::Exception->new(404, MISSING_ENV_ERROR)->get_hash();
        }

        my $output = $llama->analyze($log);
        if (!$output) {
            warning(get_warning_message(request));
            status 500;
            return Lopt::Model::Exception->new(500, GENERIC_ERROR)->get_hash();
        }

        debug(get_success_message(request));
        status 200;
        return {output  => $output};
    };

    post '/stop' => sub {
        debug(get_debug_message(request));

        if (!Lopt::Execution::Llama::terminate_llama_cli_instances()) {
            status 500;
            warning(get_warning_message(request));
            return Lopt::Model::Exception->new(500, GENERIC_ERROR)->get_hash();
        }

        debug(get_success_message(request));
        status 200;
    };
};

1;
