FROM ubuntu:22.04

# Tools
RUN apt-get update && \
        apt-get install -y software-properties-common

# Remove location interaction
ENV DEBIAN_FRONTEND noninteractive

# Install dependencies
RUN add-apt-repository ppa:ondrej/php && apt-get update \
                      && apt-get install -y \
                        php8.2 \
			php8.2-zip \
                        php8.2-xml \
                        php8.2-curl \
                        php8.2-mysql \
                        php8.2-redis \
                        mysql-client \
                        composer \
                        npm

# Workspace
RUN git clone https://github.com/laravelio/laravel.io.git
WORKDIR /laravel.io

# .env
RUN cp .env.example .env

# Install php dependencies
RUN composer install

# Generate app key
RUN php artisan key:generate

# Npm
RUN npm install
RUN npm run build

# Copy script
COPY setup.sh .

# Add script permissions
RUN chmod +x setup.sh

# Run script
CMD ./setup.sh

# Expose container port
EXPOSE 80
