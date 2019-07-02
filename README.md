# Automating Certbot Manual HTTP challenge

This script provides renewal of Let's Encrypt certificates using Certbot's manual option and the HTTP challenge.

## Getting Started

### Context
The service Let's Encrypt is a certificate authority providing free certificates to establish communication via HTTPS.
The Let's Encrypt service can be found here:
https://letsencrypt.org/getting-started/

ACME describes the protocol used by Let's Encrypt to communicate with certificate requesting web servers.
A variety of clients are available to communicate with Let's Encrypt.
Certbot is the recommended solution and is also used here.

Certificates issued by Let's Encrypt are valid for 90 days.
It is recommended to renew a certificate after 60 days.
Preexisting configurations for popular environments like Apache and Nginx exist.
Preexisting configurations are expected to automatically renew certificates with little configuration necessary.

Without Apache or Nginx other certificate issuing options are given by using the webroot or standalone plugins for Certbot.
Another option is given by DNS plugins which are available for popular hosting companies.
Lastly, a manual option is available which is what I'll be automating here.

An overview of options is given in the Certbot documentation: 
https://certbot.eff.org/docs/using.html#getting-certificates-and-choosing-plugins

### Prerequisites
The expect scripting language can expect some console output and respond as desired.

    apt install expect

A Node server will serve the key created for the http challenge under a special URL.
Manually check for up to date information on how to install Node and NPM on your distribution:
https://nodejs.org/en/download/package-manager/

    # For example, installing Node using Debian, as root
    curl -sL https://deb.nodesource.com/setup_10.x | bash -
    apt-get install -y nodejs

PM2 is a process manager for Node. It will let the Node server run as process independent from a terminal.
The documentation can be found here: https://pm2.io/doc/en/runtime/quick-start/?utm_source=pm2&utm_medium=website&utm_campaign=rebranding
    
    # Installation of PM2 using NPM
    npm install pm2 -g

    # Installation recommended on Debian
    apt update && apt install sudo curl && curl -sL https://raw.githubusercontent.com/Unitech/pm2/master/packager/setup.deb.sh | sudo -E bash -

### Setup

Your root project folder may live wherever you like, for example it may be a folder called certbotScript in your home directory.
Navigate to your root folder and make the scripts executable.

    cd /home/user/certbotScript
    chmod +x certMainScript certExpect certCall startPython startServer

For a user to run certbot write permissions are necessary on the following directories. Read on https://certbot.eff.org/faq/#does-certbot-require-root-administrator-privileges for more information about privileges.

    /etc/letsencrypt/
    /var/log/letsencrypt
    /var/lib/letsencrypt

Lastly as a reminder, when working with Windows and Linux systems convert line endings accordingly.

### Testing

The certCall bash script is responsible for running Certbot.
To test that the script works for your purposes Certbot should be instructed to generate a test certificate.
The number of certificates you may request from Let's Encrypt is limited to 50 per week (https://letsencrypt.org/docs/rate-limits/).
The "--test-cert" flag is used to let Certbot create a test certificate.

    certbot --test-cert certonly --manual --preferred-challenges=http --manual-public-ip-logging-ok -d example.com > keyFile.txt

### Deployment

Remove the testing flag from certCall and replace the placeholder domain with your domain.

    certbot certonly --manual --preferred-challenges=http --manual-public-ip-logging-ok -d example.com > keyFile.txt

#### Freeing port 80

Because the node server performing the http challenge will be running on port 80 it is necessary to stop services occupying port 80.
Restart your usual http services after completion of the Certbot http challenge.

## Running the script
Navigate to your root folder and call certMainScript.

    cd /home/user/certbotScript
    ./certMainScript

This will create a certificate once.

## Automation with crontab
To run this script in a two month interval, use crontabs.

When running a crontab service use the --force-renewal flag when invoking Certbot to ensure that new certificates are created even though non-expired ones exist.
Certbot will per default only renew certificates older than 60 days.
In some cases crontab may try to renew certificates after 60 days or less since the number of days varies between months.
    
    certbot certonly --force-renewal --manual --preferred-challenges=http --manual-public-ip-logging-ok -d example.com > keyFile.txt

Crontab instructions are stored in a crontab file. On Debian and Ubuntu, /var/spool/cron/crontabs/ contains the crontab file.
To edit your crontab file or create it run the following command.

    crontab -e

You may have to select an editor when editing your crontab file using a terminal.
Compared to Vi, Nano will be the simpler option and sufficiently powerful for this task.
A crontab instruction is written on a single line.
Extensive explanation of the syntax is available on https://help.ubuntu.com/community/CronHowto.
As an illustration of crontab use consider the following example. To run a command at 15:55 on the third day of every even month regardless of weekday, the following line is added to the crontab file.

    55 15 3 */2 * command

Since port 80 also needs to be freed during the Cerbot http challenge incorporate stopping and restarting your other applications running via http.
For example, stop a node service called index at 00:00, perform the http challenge at 00:01 and restart the index service at 00:02.
The following lines of crontab will execute the first day of each even month.
Notice that stopServer and startServer within the crontabScripts folder of this project refer to stopping the exemplary node index application.

    0 0 1 */2 * /home/user/certbotScript/crontabScripts/stopServer
    1 0 1 */2 * /home/user/certbotScript/certMainScript
    2 0 1 */2 * /home/user/certbotScript/crontabScripts/startServer

Ensure that scripts will be executed exactly when you expect them to by verifying your current time zone is set correctly.

    timedatectl

In case necessary, you may list available time zones and set a time zone; afterwards verify your local time zone again.
A user needs privileges to set the local time zone.

    timedatectl list-timezones
    sudo timedatectl set-timezone Europe/Berlin
    timedatectl

## Script structure

Here I given an overview of the tasks and subtasks performed by the main script for performing the Certbot http challenge.

    mainScript (Bash):
        Tasks:
        Invoke expectScript
        Invoke certEdit.py
        Invoke Node server
        Cleanup

        expectScript (Expect):
            Tasks:
            Invoke certCall
            Expect "... http-01 challenge for example.com"
                Start html challenge

            certCall (Bash):
                Tasks:
                Invoke certbot with arguments
                Write keyFile.txt
        
        certEdit.py (Python):
            Tasks:
            Read keyFile.txt
            Add keyPart1 to cert.js of Node Server
            Add keyPart1+Part2 to pasteCertificate.txt
        
        Node server (Node, JavaScript):
            Tasks:
            Index keyPart1 as URL
            Serve keyPar1+Part2 from pasteCertificate.txt under keyPart1 as URL


    Schematic timeline of execution:
        expect-------------------------------------
        ---------------------------startChallenge--
        -------python---startServer---------------stopServer