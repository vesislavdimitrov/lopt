package Lopt::Controllers::UploadController;

use strict;
use warnings;

use Dancer2 appname => 'Lopt';
use File::Basename;
use File::Spec;
use Cwd;
use Lopt::Model::Exception;
use Lopt::Constants;
use Lopt::Controllers::Utils qw(
    get_debug_message
    get_warning_message
    get_banned_method_message
);

my $UPLOAD_DIR = getcwd() . $WORKSPACE_DIR;

prefix '/upload' => sub {

    post '' => sub {
        if (!-d $UPLOAD_DIR) {
            mkdir $UPLOAD_DIR or return send_error("Failed to create upload directory", 500);
        }

        my $upload = upload('script');
        if (!$upload) {
            status 400;
            return Lopt::Model::Exception->new(
                400,
                'No file uploaded or incorrect parameter name'
            )->get_hash();
        }

        if ($upload->basename !~ /\.sh$/) {
            status 400;
            return Lopt::Model::Exception->new(
                400,
                'Only shell script files (.sh) are allowed'
            )->get_hash();
        }

        my $destination = File::Spec->catfile($UPLOAD_DIR, $upload->basename);
        eval {
            $upload->copy_to($destination);
            chmod 0755, $destination or die "Failed to set permissions: $!";
        };
        if ($@) {
            status 500;
            return Lopt::Model::Exception->new(
                400,
                "Failed to save the uploaded file: $@"
            )->get_hash();
        }

        status 201;
        return {
            message => 'Shell script uploaded successfully',
            file => $upload->basename 
        };
    };

    any ['put', 'patch', 'get', 'delete'] => '/script' => sub {
        warning(get_banned_method_message(request));
        status 405;
        return Lopt::Model::Exception->new(405, warning(get_banned_method_message(request)))->get_hash();
    };
};

1;
