#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Plack::Builder;
use Plack::Middleware::CrossOrigin;

# use this block if you don't need middleware, and only have a single target Dancer app to run here
use Lopt;

my $app = Lopt->to_app;

builder {
    enable "Plack::Middleware::CrossOrigin",
      origins => '*',
      methods => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers => ['Content-Type', 'Authorization', 'X-Requested-With'];
    $app;
}

=begin comment
# use this block if you want to include middleware such as Plack::Middleware::Deflater

use Lopt;
use Plack::Builder;

builder {
    enable 'Deflater';
    Lopt->to_app;
}

=end comment

=cut

=begin comment
# use this block if you want to mount several applications on different path

use Lopt;
use Lopt_admin;

use Plack::Builder;

builder {
    mount '/'      => Lopt->to_app;
    mount '/admin'      => Lopt_admin->to_app;
}

=end comment

=cut

