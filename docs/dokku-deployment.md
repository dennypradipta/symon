# Dokku Deployment

Dokku is an extensible, open source Platform as a Service that runs on a single server of your choice. This guide will help you to install Symon using Dokku in your server.

## Prerequisite

Below are the things you need to prepare for Dokku Deployment:

1. Basic knowledge of Docker
2. A server, preferably DigitalOcean droplets or similar with following minimum requirements:
   - A fresh installation of Ubuntu 18.04/20.04 x64, Debian 9+ x64 or CentOS 7 x64 (experimental)
   - At least 1 GB of system memory
3. A domain name is optional, but it is recommended
4. Patience

## Steps

1.  Clone the Repository

    First, you must clone the Symon repository to your local computer in order to do Git deployments or building image from source. If you're using the 'Deploying from a Docker Registry', it is not required.

2.  Install Dokku

    Login to your server, and type these commands in server's terminal to install Dokku:

    ```
    wget https://raw.githubusercontent.com/dokku/dokku/v0.24.10/bootstrap.sh;
    sudo DOKKU_TAG=v0.24.10 bash bootstrap.sh
    ```

    The installation process takes about 5-10 minutes, depending upon internet connection speed.

3.  Setup SSH key and Virtualhost Settings

    Once the installation is complete, you can open a browser to setup your SSH key and virtualhost settings. Open your browser of choice and navigate to the server's IP address - or the domain you assigned to the server previously - and configure Dokku via the web admin.

4.  Create the `frontend` and `api` app

    You may now create two apps in order to run Symon: `frontend` and `api`. Type these commands in the server's terminal to create both apps:

    ```
    dokku apps:create frontend
    dokku apps:create api
    ```

    This will be used later for deployments.

5.  Set the Corresponding Dockerfile for Each App using Docker Options

    **NOTE: If you're going to deploy the app using the "Deploying from a Docker Registry" method, you may skip this step.**

    In order to tell Dokku which Dockerfile we need to use when deploying an app, we need to set the corresponding Dockerfile for each app using Dokku Docker options. Run these commands below in the server's terminal:

    ```
    # This will set the Dockerfile.client to `frontend` app
    dokku docker-options:add frontend build --file Dockerfile.client
    # This will set the Dockerfile.server to `api` app
    dokku docker-options:add api build --file Dockerfile.server
    ```

    The command above will deploy `frontend` app using Dockerfile.client file, and deploy `api` app using Dockerfile.server file.

6.  Set Environmental Variables

    You can add the environment variables using Dokku Docker options. Run these commands below in the server's terminal:

    ```
    # This will set the `frontend` app ENV values
    dokku config:set frontend NODE_ENV=production DATABASE_URL="file:./dev.db" REACT_APP_API_URL=http://localhost:8080 REACT_APP_API_PREFIX=/v1

    # This will set the `api` app ENV values
    dokku config:set api NODE_ENV=production PORT=8080 DATABASE_URL="file:./dev.db" JWT_SECRET="thisIsJwtSecret" JWT_ISSUER="admin@kaksymon.com" JWT_ACCESS_EXPIRED=5m JWT_REFRESH_EXPIRED=1y JWT_ALGORITHM=HS256
    ```

    You may refer to the .env.example for setting up the environment variables above, and change the enviroment variables according to your needs.

7.  Deploy the app!

    There are two ways to do deployment: Git and Docker deployment.

    a. Git Deployment

    In your cloned Symon directory, add a new git remote by typing these command below in your local terminal:

    ```
    # This will add deployment for `api` app
    git remote add dokku-api dokku@<your_server_domain_or_ip_address>:api
    # This will add deployment for `frontend` app
    git remote add dokku-frontend dokku@<your_server_domain_or_ip_address>:frontend
    ```

    Now, you can deploy your `api` app by using `git push dokku-api main:master` or `git push dokku-frontend main:master` to deploy `frontend`.

    b. Docker Deployment

    - Deploying from a Docker Registry

      In your server's terminal, pull the Symon both frontend and api images:

      ```
      docker pull hyperjumptech/symon-api:latest
      docker pull hyperjumptech/symon-frontend:latest
      ```

      Now that we have pulled the latest image for both `api` and `frontend`, we need to retag the pulled image using the commands below:

      ```
      docker tag hyperjumptech/symon-api:latest dokku/api:latest
      docker tag hyperjumptech/symon-frontend:latest dokku/frontend:latest
      ```

      After retagging, we could deploy the `api` and `frontend` using the commands below:

      ```
      dokku tags:deploy api latest
      dokku tags:deploy frontend latest
      ```

    - Deploying by building from local image

      In your cloned Symon directory, you need to build the Docker image. Build the docker image using the command below:

      ```
      # Note: The image must be tagged `dokku/<app-name>:<version>`
      # Build the API
      docker build --build-arg NODE_ENV=production \
          --build-arg PORT=8080 \
          --build-arg DATABASE_URL="file:./dev.db" \
          --build-arg JWT_SECRET="thisIsJwtSecret" \
          --build-arg JWT_ISSUER="admin@kaksymon.com" \
          --build-arg JWT_ACCESS_EXPIRED=5m \
          --build-arg JWT_REFRESH_EXPIRED=1y \
          --build-arg JWT_ALGORITHM=HS256 \
          -f Dockerfile.server . -t dokku/api:latest

      # Build the Frontend
      docker build --build-arg NODE_ENV=production \
          --build-arg DATABASE_URL="file:./dev.db" \
          --build-arg REACT_APP_API_URL=http://localhost:8080 \
          --build-arg REACT_APP_API_PREFIX=/v1 \
          -f Dockerfile.client . -t dokku/frontend:latest
      ```

      You may refer to the .env.example for setting up the environment variables above, and change the enviroment variables according to your needs.

      After building the image, deploy the image using the command below:

      ```
      # Copy the image, tag, and deploy the API
      docker save dokku/api:latest | bzip2 | ssh <your_server_domain_or_ip_address> "bunzip2 | docker load"
      ssh <your_server_domain_or_ip_address> "dokku tags:create api previous; dokku tags:deploy api latest"

      # Copy the image, tag, and deploy the Frontend
      docker save dokku/api:latest | bzip2 | ssh <your_server_domain_or_ip_address> "bunzip2 | docker load"
      ssh <your_server_domain_or_ip_address> "dokku tags:create api previous; dokku tags:deploy api latest"
      ```

      You could do the same process for CI process too by setting the ENV from the Secrets.
