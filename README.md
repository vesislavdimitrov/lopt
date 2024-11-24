# Lopt

A task executor REST API, based on Perl Dancer2.

## Starting Lopt REST API
- То run the server, cd to the parent directory of this server and then run ```plackup -s Starman bin/app.psgi```.
- It is recommended that the server is ran using screen/nohup, for example ```screen plackup -s Starman bin/app.psgi```.

## Notes
- This was built and tested using Perl 5.18.2 and is confirmed to be completely stable with the latest release, which is 5.32.0 at the time of writing this.
- You need to have Plack and Starman installed in order to start the Dancer2 server.
- If you don't have Plack properly installed, usually when trying to start the server with the above commands an error like ```command not found: plackup``` occurs.