use strict;
use warnings;
use ExtUtils::MakeMaker;

# Normalize version strings like 6.30_02 to 6.3002,
# so that we can do numerical comparisons on it.
my $eumm_version = $ExtUtils::MakeMaker::VERSION;
$eumm_version =~ s/_//;

WriteMakefile(
    NAME                => 'Lopt',
    AUTHOR              => q{<Vesislav Dimitrov>},
    VERSION_FROM        => 'lib/Lopt.pm',
    ABSTRACT            => 'A REST API server that allows users to perform certain OS operations over HTTP.',
    ($eumm_version >= 6.3001
      ? ('LICENSE'=> 'perl')
      : ()),
    PL_FILES            => {},
    PREREQ_PM => {
        'Test::More'                => 0,
        'YAML'                      => 0,
        'XML::Hash::XS'             => 0,
        'Dancer2::Logger::Log4perl' => 0,
        'Dancer2'                   => 0.300005,
        'MongoDB'                   => 0
    },
    dist                => { COMPRESS => 'gzip -9f', SUFFIX => 'gz', },
    clean               => { FILES => 'Lopt-*' },
);
