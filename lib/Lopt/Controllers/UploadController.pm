package Lopt::Controllers::UploadController;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use File::Basename;
use File::Spec;
use Cwd;
use Lopt::Validation;
use Lopt::Model::Exception;
use Lopt::Constants;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_warning_message
    get_banned_method_message
    get_success_message
    get_auth_error
    authorize
);

use constant {
    FAILED_TO_CREATE_DIR => 'Failed to create upload directory',
    NO_FILE_UPLOADED => 'No file uploaded or incorrect parameter name',
    WRONG_FORMAT => 'Only shell script files (.sh) are allowed',
    CANNOT_CHANGE_PERMISSIONS => 'Failed to set permissions!',
    CANNOT_PERSIST_FILE => 'Failed to save the uploaded file!',
    SUCCESS => 'Shell script uploaded successfully'
};

my $UPLOAD_DIR = getcwd() . $WORKSPACE_DIR;

prefix '/upload' => sub {

    post '' => sub {
        debug(get_debug_message(request));
        return get_auth_error(request) if !authorize(request);

        if (!-d $UPLOAD_DIR) {
            mkdir $UPLOAD_DIR or do {
                warning(get_warning_message(request));
                status 500;
                return Lopt::Model::Exception->new(500, FAILED_TO_CREATE_DIR)->get_hash();
            }
        }

        my $upload = upload('script');
        if (!$upload) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, NO_FILE_UPLOADED)->get_hash();
        }

        if (!is_shell_script($upload->basename)) {
            warning(get_warning_message(request));
            status 400;
            return Lopt::Model::Exception->new(400, WRONG_FORMAT)->get_hash();
        }

        my $destination = File::Spec->catfile($UPLOAD_DIR, $upload->basename);
        eval {
            $upload->copy_to($destination);
            chmod 0755, $destination or die CANNOT_CHANGE_PERMISSIONS;
        };
        if ($@) {
            warning(get_warning_message(request));
            status 500;
            return Lopt::Model::Exception->new(500, CANNOT_PERSIST_FILE)->get_hash();
        }

        debug(get_success_message(request));
        status 201;
        return {message => SUCCESS, file => $upload->basename};
    };

    any ['put', 'patch', 'get', 'delete'] => '/script' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };
};

1;
