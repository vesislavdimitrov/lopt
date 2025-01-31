package Lopt::Execution::Llama;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use IO::Pipe;

use constant {
    LLAMA_CLI_LOCATION => $ENV{LOPT_LLAMA_CLI_LOCATION},
    GGUF_MODEL_LOCATION => $ENV{LOPT_GGUF_MODEL_LOCATION},
    LLAMA_CLI_THREADS => $ENV{LOPT_LLAMA_CLI_THREADS},
    LLAMA_CLI_CALL_BASE => '%s -m %s --no-display-prompt -c %s --temp %s --repeat_penalty %s -n %s --threads %s --mlock -p "%s" --no-warmup 2>/dev/null'
};

sub new {
    my ($class, $context_size, $temperature, $repeat_penalty, $tokens) = @_;
    my $self = {
        model_path => GGUF_MODEL_LOCATION,
        context_size => $context_size || 514,
        temperature => $temperature || 0,
        repeat_penalty => $repeat_penalty || 1.2,
        tokens => $tokens || 52,
        threads => LLAMA_CLI_THREADS
    };
    bless $self, $class;
    return $self;
}

sub get_model_path {
    my ($self) = @_;
    return $self->{model_path};
}

sub set_model_path {
    my ($self, $model_path) = @_;
    $self->{model_path} = $model_path;
}

sub analyze {
    my ($self, $prompt) = @_;
    return $self->_execute_llm(
        $self->_build_command($prompt)
    );
}

sub has_needed_environment {
    my ($self) = @_;
    return 0 if !LLAMA_CLI_LOCATION || !GGUF_MODEL_LOCATION || !LLAMA_CLI_THREADS;
    return 1
}

sub _execute_llm {
    my ($self, $command) = @_;
    my $pipe = IO::Pipe->new();
    $pipe->reader($command);

    my $output = '';
    while (my $line = <$pipe>) {
        $output .= $line;
    }
    close($pipe);
    return $self->_get_trimmed_output($output);
}

sub _build_command {
    my ($self, $prompt) = @_;
    return sprintf(
        LLAMA_CLI_CALL_BASE,
        LLAMA_CLI_LOCATION,
        $self->get_model_path(),
        $self->{context_size},
        $self->{temperature},
        $self->{repeat_penalty},
        $self->{tokens},
        $self->{threads},
        $self->_build_prompt($prompt)
    );
}

sub _build_prompt {
    my ($self, $prompt) = @_;
    my $system_prompt =
        "You are an AI assistant that ONLY helps analyze logs from tasks" .
        "Below is an instruction that describes a task. Write " .
        "a response that appropriately completes the request.\n" .

        "### Instruction: This is the output of the command. Check it out, note if there " .
        "are any issues. It is a command run in the shell. " .
        "Try to be short in your response and only point out potentially important information. " .

        "The outpput is under the =====OUTPUT==== line " .
        "DO NOT say that the output is displayed in bold " .
        "DO NOT ask for additional context: %s " .
        "DO NOT add any unrelated information " .

        "\n### Response:" ;
    return sprintf($system_prompt, $prompt);
}

sub _get_trimmed_output {
    my ($self, $output) = @_;
    $output =~ s/\s*\[end of text\]\s*$//g;
    return $output;
}

sub terminate_llama_cli_instances {
    my @pids = `pgrep -f llama`;
    chomp(@pids);
    return 1 unless @pids;

    my $max_pid = (sort { $b <=> $a } @pids)[0];    
    eval { kill 9, $max_pid if $max_pid =~ /^\d+$/; };
    return 0 if $@;
    
    return 1;
}

1;
