# Pictoroma server

A self hosted server for sharing images with friends and family

## Installation

The recommended installation method is using docker. The server requires a set of environment variables to be set to work correctly

### Example "minimal" `docker-compose` file with required values

```yaml
version: "3"
services:
  pictoroma:
    image: ghcr.io/pictoroma/server:main
    environment:
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=$up3r$3cretP4ssw0rd!
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=mygmailaccount@gmail.com
      - SMTP_PASSWORD=my-gmail-password
      - EMAIL_FROM=mygmailaccount@gmail.com
      - URL=http://localhost:4000
    volumes:
      - "./data:/data"
    ports:
      - "4000:4000"
```
