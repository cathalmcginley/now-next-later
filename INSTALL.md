Installing NowNextLater
=======================

NowNextLater is a Node.js web service (built using Express.js) using a
Neo4J graph database. The api/ and web/ directories each contain a web
app: api/ is the back-end RESTful web service, and web/ is the
front-end which delivers a Single Page Application (built with
AngularJS) to the user. The two apps run on different ports, so you
must tie them together with your web server configuration (it is very
easy with Nginx). This document describes how to set things up.


Install Neo4J as a database server
----------------------------------


Set up the API back-end app
---------------------------

    cd now-next-later/api
    npm install
    gulp


Set up the Web front-end app
----------------------------

    cd now-next-later/web
    npm install
    gulp


Configure Nginx web server / proxy
----------------------------------

    server {
      listen 80;
      server_name now-next-later.local;

      # Let's put all static files like images, js and css in sub-folder: public
      root /srv/now-next-later/web/public;

      #  static content
      location ~* ^.+.(jpg|jpeg|gif|css|png|js|ico|xml)$ {
        # access_log        off;
        expires           15d;
      }

      # the RESTful NowNextLater Api
      location /users/ {
        proxy_pass         http://127.0.0.1:3002;
        proxy_set_header   X-Real-IP              $remote_addr;
        proxy_set_header   X-Forwarded-For        $proxy_add_x_forwarded_for;
        proxy_set_header   Host                   $http_host;
        proxy_set_header   X-NginX-Proxy          true;
        proxy_redirect off;
      }

      # the Front-End is hosted by a different Express.js app
      location / {
        proxy_pass         http://127.0.0.1:3004;
        proxy_set_header   X-Real-IP              $remote_addr;
        proxy_set_header   X-Forwarded-For        $proxy_add_x_forwarded_for;
        proxy_set_header   Host                   $http_host;
        proxy_set_header   X-NginX-Proxy          true;
        proxy_redirect off;
      }


      gzip on;
      #gzip off;
      gzip_comp_level 2;
      gzip_proxied any;
      gzip_min_length  1000;
      gzip_disable     "MSIE [1-6]\."
      gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
    }


