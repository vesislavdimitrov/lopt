package Lopt::Controllers::HomeController;

use Dancer2 appname => 'Lopt';

get '/' => sub {
    return {
        message => 'Lopt is available'
    };
};

1;